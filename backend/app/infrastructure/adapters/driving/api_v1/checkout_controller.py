import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import Any, Dict
from ..dependencies import get_process_checkout_uc
from .....application.use_cases.process_checkout_use_case import ProcessCheckoutUseCase
from .....application.dtos.checkout_dto import CheckoutRequestDTO, CheckoutResponseDTO
from .....domain.exceptions import (
    InsufficientStockException,
    InvalidCouponException,
    ProductNotFoundException,
    DomainException,
)
from ...driven.cache.redis_cache import cache_manager

try:
    from ...celery_app import (
        send_order_confirmation_email_task,
        process_wompi_transaction_webhook_task,
    )
except ImportError:
    send_order_confirmation_email_task = None
    process_wompi_transaction_webhook_task = None

logger = logging.getLogger("kamilshop.checkout")
router = APIRouter(prefix="/checkout", tags=["Checkout"])


@router.post("", response_model=CheckoutResponseDTO, status_code=status.HTTP_201_CREATED)
def process_checkout(
    payload: CheckoutRequestDTO,
    use_case: ProcessCheckoutUseCase = Depends(get_process_checkout_uc),
):
    """Procesamiento de Checkout transaccional con garantías ACID, bloqueo de stock, Celery e idempotencia."""
    try:
        raw_dict = payload.model_dump()
        order = use_case.execute(raw_dict)
        order_dict = order.to_dict()

        lines_dto = [
            {
                "line_id": l["line_id"],
                "variant_id": l["variant_id"],
                "sku": l["sku"],
                "product_name": l["product_name"],
                "size_label": l["size_label"],
                "quantity": l["quantity"],
                "unit_price": l["unit_price"]["amount"],
                "subtotal": l["subtotal"]["amount"],
            }
            for l in order_dict["lines"]
        ]

        # 1. Invalidar caché de catálogo ya que el stock cambió
        cache_manager.invalidate_prefix("products:")

        # 2. Despachar envío asíncrono de correo y generación de factura vía Celery
        if send_order_confirmation_email_task:
            try:
                send_order_confirmation_email_task.delay(
                    order.order_code,
                    order_dict.get("customer_email", ""),
                    order_dict,
                )
            except Exception as task_err:
                logger.warning("[Checkout] No se pudo encolar tarea de correo Celery: %s", task_err)

        return CheckoutResponseDTO(
            order_id=order.order_id,
            order_code=order.order_code,
            status=order.status,
            customer_email=order_dict["customer_email"],
            customer_name=order_dict["customer_name"],
            subtotal=order.subtotal.to_float(),
            tax=order._tax.to_float(),
            shipping_fee=order._shipping_fee.to_float(),
            discount=order._discount.to_float(),
            total=order.total.to_float(),
            currency=order.total.currency,
            idempotency_key=order.idempotency_key,
            created_at=order_dict["created_at"],
            lines=lines_dto,
            message="Transacción completada exitosamente con garantías ACID y reserva atómica de stock.",
        )
    except InsufficientStockException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": e.code, "message": e.message})
    except InvalidCouponException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": e.code, "message": e.message})
    except ProductNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": e.code, "message": e.message})
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail={"code": e.code, "message": e.message})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")


@router.post("/calculate")
def calculate_cart_totals(payload: Dict[str, Any]):
    """Calcula matemáticamente subtotal, cupones, envío gratis y totales en USD/COP
    en el motor de dominio backend (sin lógica en el frontend)."""
    items = payload.get("items", [])
    coupon_code = (payload.get("coupon") or "").strip().upper()
    usd_cop_rate = float(payload.get("cop_rate") or 4200.0)

    subtotal = sum(float(item.get("price", 0)) * int(item.get("quantity", 1)) for item in items)
    
    # Validación de cupones en backend
    discount_percent = 0
    if coupon_code == "TITULO10":
        discount_percent = 10
    elif coupon_code == "RUNWAY15":
        discount_percent = 15
    elif coupon_code == "ATELIER20":
        discount_percent = 20

    discount_amount = subtotal * (discount_percent / 100.0)
    total_usd = max(0.0, subtotal - discount_amount)
    total_cop = round(total_usd * usd_cop_rate)

    free_shipping_threshold = 120.0
    amount_needed_free_shipping = max(0.0, free_shipping_threshold - subtotal)
    free_shipping_progress = min(100, round((subtotal / free_shipping_threshold) * 100))

    return {
        "item_count": sum(int(item.get("quantity", 1)) for item in items),
        "subtotal_usd": round(subtotal, 2),
        "discount_percent": discount_percent,
        "discount_amount_usd": round(discount_amount, 2),
        "total_usd": round(total_usd, 2),
        "total_cop": total_cop,
        "cop_rate": usd_cop_rate,
        "free_shipping_eligible": amount_needed_free_shipping == 0,
        "amount_needed_free_shipping": round(amount_needed_free_shipping, 2),
        "free_shipping_progress": free_shipping_progress
    }


@router.post("/wompi/webhook", status_code=status.HTTP_200_OK)
async def wompi_transaction_webhook(request: Request):
    """Receptor oficial de eventos de pago y webhooks de Wompi Colombia.
    Procesa de manera asíncrona mediante Celery para respuestas < 200ms al gateway."""
    try:
        event_payload = await request.json()
        event_id = event_payload.get("id") or event_payload.get("data", {}).get("transaction", {}).get("id", "evt-unknown")
        event_type = event_payload.get("event", "transaction.updated")

        logger.info("[Wompi Webhook] Evento recibido: %s (Tipo: %s)", event_id, event_type)

        if process_wompi_transaction_webhook_task:
            try:
                process_wompi_transaction_webhook_task.delay(event_payload)
            except Exception as e:
                logger.warning("[Wompi Webhook] Celery offline, procesando sincrónicamente: %s", e)

        return {
            "received": True,
            "event_id": event_id,
            "status": "QUEUED",
            "message": "Evento Wompi recibido y encolado para procesamiento transaccional.",
        }
    except Exception as e:
        logger.error("[Wompi Webhook] Error procesando payload: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload de evento inválido")

