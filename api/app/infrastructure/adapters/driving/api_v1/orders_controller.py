from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from ..dependencies import get_container
from app.infrastructure.security import get_current_admin, get_current_user, sanitize_order_for_public

router = APIRouter(prefix="/orders", tags=["Orders & Fulfillment (Database)"])


class CreateOrderDTO(BaseModel):
    name: Optional[str] = "Cliente Kamil Shop"
    email: Optional[str] = "cliente@kamilshop.store"
    phone: Optional[str] = None
    address: Optional[str] = "Dirección de Entrega"
    city: Optional[str] = "Bogotá"
    carrier: Optional[str] = "Coordinadora Express"
    total: float = 0.0
    subtotal: Optional[float] = None
    tax: Optional[float] = 0.0
    shipping_fee: Optional[float] = 0.0
    notes: Optional[str] = None
    is_gift_wrapped: Optional[bool] = False
    provider: Optional[str] = "store_guest"
    items: List[Dict[str, Any]] = Field(default_factory=list)


class UpdateOrderStatusDTO(BaseModel):
    status: str
    notes: Optional[str] = None


@router.get("", response_model=List[Dict[str, Any]])
def list_real_orders(admin: dict = Depends(get_current_admin)):
    """Retorna todas las órdenes reales guardadas en la base de datos. Requiere Admin."""
    container = get_container()
    if hasattr(container.order_repo, "list_all"):
        return container.order_repo.list_all()
    return []


@router.get("/track/{code}")
def track_order(code: str):
    """Rastrea una orden en tiempo real por su código. Retorna información sanitizada (PII protegida)."""
    container = get_container()
    if hasattr(container.order_repo, "find_by_code"):
        order = container.order_repo.find_by_code(code)
        if order:
            order_dict = order if isinstance(order, dict) else (order.to_dict() if hasattr(order, "to_dict") else dict(order))
            return sanitize_order_for_public(order_dict)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se encontró orden con código '{code}'.")


@router.get("/by-email/{email}")
def list_orders_by_customer(
    email: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """Consulta las compras realizadas por el correo especificado. Requiere coincidencia de sesión o sesión activa."""
    container = get_container()
    orders = container.order_repo.list_by_customer_email(email)
    
    # Si el solicitante no es el dueño ni un Admin, sanitizar los datos de envío
    is_owner_or_admin = current_user and (
        current_user.get("role") == "ADMIN" or 
        current_user.get("email", "").lower() == email.lower()
    )
    
    if is_owner_or_admin:
        return orders
    else:
        return [sanitize_order_for_public(o) for o in orders]


@router.get("/{order_id}")
def get_order_by_id(
    order_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """Obtiene el detalle de una orden en la base de datos."""
    container = get_container()
    order = container.order_repo.find_by_id(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada en la base de datos.")
    
    order_dict = order if isinstance(order, dict) else (order.to_dict() if hasattr(order, "to_dict") else dict(order))
    
    is_owner_or_admin = current_user and (
        current_user.get("role") == "ADMIN" or 
        current_user.get("email", "").lower() == order_dict.get("email", "").lower() or
        current_user.get("email", "").lower() == order_dict.get("customer_email", "").lower()
    )
    
    if is_owner_or_admin:
        return order_dict
    return sanitize_order_for_public(order_dict)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(payload: CreateOrderDTO):
    """Crea una orden real directamente en la base de datos."""
    container = get_container()
    if hasattr(container.order_repo, "save_raw"):
        created = container.order_repo.save_raw(payload.model_dump())
        return created
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Repositorio no soporta save_raw.")


@router.patch("/{order_id}/status")
def update_order_status(
    order_id: str,
    payload: UpdateOrderStatusDTO,
    admin: dict = Depends(get_current_admin)
):
    """Actualiza el estado de una orden en la base de datos. Requiere Admin."""
    container = get_container()
    if hasattr(container.order_repo, "update_status"):
        updated = container.order_repo.update_status(order_id, payload.status, payload.notes)
        if updated:
            return updated
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se pudo actualizar la orden '{order_id}'.")


@router.delete("/{order_id}")
def delete_order(
    order_id: str,
    admin: dict = Depends(get_current_admin)
):
    """Elimina una orden de la base de datos. Requiere Admin."""
    container = get_container()
    if hasattr(container.order_repo, "delete"):
        ok = container.order_repo.delete(order_id)
        if ok:
            return {"success": True, "message": f"Orden '{order_id}' eliminada de la base de datos."}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Orden '{order_id}' no encontrada.")
