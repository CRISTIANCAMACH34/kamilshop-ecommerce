from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional


class CartItemDTO(BaseModel):
    product_id: str
    variant_id: str
    quantity: int = Field(..., gt=0)


class ShippingAddressDTO(BaseModel):
    country_iso: str = Field(..., min_length=2, max_length=2)
    state_subdivision: str
    city: str
    street_type: str = "Calle"
    street_name: str
    exterior_number: str
    interior_number: Optional[str] = None
    neighborhood: Optional[str] = None
    postal_code: str
    reference: Optional[str] = None


class CheckoutRequestDTO(BaseModel):
    idempotency_key: str = Field(..., min_length=16, max_length=64)
    customer_email: EmailStr
    customer_name: str = Field(..., min_length=3)
    customer_phone: Optional[str] = None
    shipping_address: ShippingAddressDTO
    payment_method: str = "CARD"
    coupon_code: Optional[str] = None
    items: List[CartItemDTO] = Field(..., min_length=1)


class OrderLineOutputDTO(BaseModel):
    line_id: str
    variant_id: str
    sku: str
    product_name: str
    size_label: str
    quantity: int
    unit_price: float
    subtotal: float


class CheckoutResponseDTO(BaseModel):
    order_id: str
    order_code: str
    status: str
    customer_email: str
    customer_name: str
    subtotal: float
    tax: float
    shipping_fee: float
    discount: float
    total: float
    currency: str
    idempotency_key: str
    created_at: str
    lines: List[OrderLineOutputDTO]
    message: str
