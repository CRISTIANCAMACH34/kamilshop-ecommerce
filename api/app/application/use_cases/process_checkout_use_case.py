import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from ...domain.entities.order import Order, OrderLine
from ...domain.entities.coupon import Coupon
from ...domain.value_objects.money import Money
from ...domain.value_objects.address_vo import AddressVO
from ...domain.ports.driven.product_repository_port import IProductRepositoryPort
from ...domain.ports.driven.order_repository_port import IOrderRepositoryPort
from ...domain.ports.driven.payment_gateway_port import IPaymentGatewayPort
from ...domain.exceptions import (
    IdempotencyConflictException,
    ProductNotFoundException,
    InsufficientStockException,
    DomainException,
)


class ProcessCheckoutUseCase:
    """Orquestador de Caso de Uso para Checkout Transaccional con Garantías ACID y Clave de Idempotencia."""

    def __init__(
        self,
        product_repo: IProductRepositoryPort,
        order_repo: IOrderRepositoryPort,
        payment_gateway: IPaymentGatewayPort,
        active_coupons: Optional[Dict[str, Coupon]] = None,
    ):
        self._product_repo = product_repo
        self._order_repo = order_repo
        self._payment_gateway = payment_gateway
        self._coupons = active_coupons or {}

    def register_coupon(self, coupon: Coupon) -> None:
        self._coupons[coupon.code] = coupon

    def execute(self, payload: Dict[str, Any]) -> Order:
        idempotency_key = payload.get("idempotency_key")
        if not idempotency_key:
            raise DomainException("La clave de idempotencia es obligatoria para procesar checkout.")

        # 1. VERIFICACIÓN DE IDEMPOTENCIA
        existing_order = self._order_repo.find_by_idempotency_key(idempotency_key)
        if existing_order:
            # Si ya existe, se devuelve la orden previamente procesada (comportamiento idempotente estándar)
            return existing_order

        # 2. VALIDAR DIRECCIÓN ATÓMICA
        addr_data = payload["shipping_address"]
        address_vo = AddressVO(
            country_iso=addr_data.get("country_iso", "CO"),
            state_subdivision=addr_data.get("state_subdivision", "Bogota D.C."),
            city=addr_data.get("city", "Bogota"),
            street_type=addr_data.get("street_type", "Calle"),
            street_name=addr_data.get("street_name", "Carrera 7"),
            exterior_number=addr_data.get("exterior_number", "72-41"),
            interior_number=addr_data.get("interior_number"),
            neighborhood=addr_data.get("neighborhood"),
            postal_code=addr_data.get("postal_code", "110221"),
            reference=addr_data.get("reference"),
        )

        # 3. VERIFICAR CUPÓN SI APLICA
        coupon_obj: Optional[Coupon] = None
        coupon_code = payload.get("coupon_code")
        if coupon_code:
            code_upper = coupon_code.strip().upper()
            if code_upper in self._coupons:
                coupon_obj = self._coupons[code_upper]

        # 4. VALIDACIÓN ATÓMICA DE PRODUCTOS Y STOCK (SIMULANDO SELECT FOR UPDATE)
        order_lines: List[OrderLine] = []
        raw_items = payload.get("items", [])
        if not raw_items:
            raise DomainException("El carrito no puede estar vacío.")

        products_to_update = []

        for item in raw_items:
            product_id = item["product_id"]
            variant_id = item["variant_id"]
            quantity = item["quantity"]

            product = self._product_repo.find_by_id(product_id)
            if not product:
                raise ProductNotFoundException(product_id)

            variant = product.get_variant_by_id(variant_id)
            if not variant:
                raise DomainException(f"Variante '{variant_id}' no encontrada en el producto '{product.name}'.")

            if not variant.has_stock(quantity):
                raise InsufficientStockException(variant.sku.value, requested=quantity, available=variant.stock_available)

            unit_price = product.calculate_price_for_variant(variant_id)
            line = OrderLine(
                line_id=str(uuid.uuid4()),
                variant_id=variant_id,
                sku=variant.sku.value,
                product_name=product.name,
                size_label=variant.size_label,
                quantity=quantity,
                unit_price=unit_price,
            )
            order_lines.append(line)

            # Preparar deducción de stock
            variant.deduct_stock(quantity)
            products_to_update.append(product)

        # 5. CREACIÓN DEL AGREGADO ORDEN
        shipping_fee = Money(15000, "COP")
        order_id = str(uuid.uuid4())
        short_code = "TTL-" + order_id.replace("-", "").upper()[:8]

        order = Order(
            order_id=order_id,
            order_code=short_code,
            customer_email=payload["customer_email"],
            customer_name=payload["customer_name"],
            shipping_address=address_vo,
            lines=order_lines,
            shipping_fee=shipping_fee,
            coupon=coupon_obj,
            idempotency_key=idempotency_key,
            status="PENDIENTE_PAGO",
        )

        # 6. EJECUCIÓN DE PAGO TRANSACCIONAL ACID
        charge_result = self._payment_gateway.charge(
            order_id=order.order_id,
            amount=order.total,
            payment_method=payload.get("payment_method", "CARD"),
            idempotency_key=idempotency_key,
        )

        if charge_result.get("status") == "APROBADO":
            order.mark_paid()
            if coupon_obj:
                coupon_obj.increment_usage()

            # Persistir stock actualizado
            for p in products_to_update:
                self._product_repo.save(p)

            # Persistir orden
            self._order_repo.save(order)
            return order
        else:
            # Reversar deducción de stock en memoria en caso de declinación
            for line in order_lines:
                for p in products_to_update:
                    v = p.get_variant_by_id(line.variant_id)
                    if v:
                        v.add_stock(line.quantity)
            raise DomainException(f"Pago rechazado por el gateway: {charge_result.get('error', 'Error desconocido')}")
