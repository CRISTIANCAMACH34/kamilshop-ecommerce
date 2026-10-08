from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
from ..value_objects.money import Money
from ..value_objects.address_vo import AddressVO
from ..entities.coupon import Coupon
from ..exceptions import DomainException


class OrderLine:
    """Entidad de línea de pedido atómica."""

    def __init__(
        self,
        line_id: str,
        variant_id: str,
        sku: str,
        product_name: str,
        size_label: str,
        quantity: int,
        unit_price: Money,
    ):
        if quantity <= 0:
            raise DomainException("La cantidad de la línea de pedido debe ser mayor a cero.")

        self._line_id = line_id
        self._variant_id = variant_id
        self._sku = sku
        self._product_name = product_name
        self._size_label = size_label
        self._quantity = quantity
        self._unit_price = unit_price
        self._subtotal = unit_price.multiply(quantity)

    @property
    def line_id(self) -> str:
        return self._line_id

    @property
    def variant_id(self) -> str:
        return self._variant_id

    @property
    def sku(self) -> str:
        return self._sku

    @property
    def product_name(self) -> str:
        return self._product_name

    @property
    def size_label(self) -> str:
        return self._size_label

    @property
    def quantity(self) -> int:
        return self._quantity

    @property
    def unit_price(self) -> Money:
        return self._unit_price

    @property
    def subtotal(self) -> Money:
        return self._subtotal

    def to_dict(self) -> Dict[str, Any]:
        return {
            "line_id": self._line_id,
            "variant_id": self._variant_id,
            "sku": self._sku,
            "product_name": self._product_name,
            "size_label": self._size_label,
            "quantity": self._quantity,
            "unit_price": self._unit_price.to_dict(),
            "subtotal": self._subtotal.to_dict(),
        }


class Order:
    """Aggregate Root que gestiona el ciclo de vida de un Pedido E-Commerce bajo garantías ACID."""

    TAX_RATE_PERCENT = 19.0  # IVA estándar

    def __init__(
        self,
        order_id: str,
        order_code: str,
        customer_email: str,
        customer_name: str,
        shipping_address: AddressVO,
        lines: List[OrderLine],
        shipping_fee: Money,
        coupon: Optional[Coupon] = None,
        idempotency_key: Optional[str] = None,
        status: str = "PENDIENTE_PAGO",
        created_at: Optional[datetime] = None,
    ):
        if not lines:
            raise DomainException("Un pedido debe contener al menos un artículo.")

        self._order_id = str(order_id)
        self._order_code = order_code
        self._customer_email = customer_email
        self._customer_name = customer_name
        self._shipping_address = shipping_address
        self._lines = list(lines)
        self._shipping_fee = shipping_fee
        self._coupon = coupon
        self._idempotency_key = idempotency_key or str(uuid.uuid4())
        self._status = status
        self._created_at = created_at or datetime.now(timezone.utc)

        # Totales calculados con Money
        self._currency = shipping_fee.currency
        self._subtotal = Money(0, self._currency)
        self._tax = Money(0, self._currency)
        self._discount = Money(0, self._currency)
        self._total = Money(0, self._currency)

        self._recalculate_totals()

    @property
    def order_id(self) -> str:
        return self._order_id

    @property
    def order_code(self) -> str:
        return self._order_code

    @property
    def idempotency_key(self) -> str:
        return self._idempotency_key

    @property
    def status(self) -> str:
        return self._status

    @property
    def subtotal(self) -> Money:
        return self._subtotal

    @property
    def total(self) -> Money:
        return self._total

    @property
    def lines(self) -> List[OrderLine]:
        return list(self._lines)

    def _recalculate_totals(self) -> None:
        subtotal = Money(0, self._currency)
        for line in self._lines:
            subtotal = subtotal.add(line.subtotal)
        self._subtotal = subtotal

        # Descuento
        if self._coupon:
            self._discount = self._coupon.calculate_discount(self._subtotal)
        else:
            self._discount = Money(0, self._currency)

        # IVA sobre el subtotal neto después del descuento
        base_imponible = self._subtotal.subtract(self._discount) if self._discount.amount < self._subtotal.amount else Money(0, self._currency)
        self._tax = base_imponible.apply_percentage(self.TAX_RATE_PERCENT)

        # Total Bruto = Subtotal - Descuento + IVA + Flete
        self._total = base_imponible.add(self._tax).add(self._shipping_fee)

    def mark_paid(self) -> None:
        if self._status in ("CANCELADA", "REEMBOLSADA"):
            raise DomainException(f"No se puede pagar una orden en estado '{self._status}'.")
        self._status = "PAGADA"

    def cancel(self, reason: str) -> None:
        if self._status == "ENTREGADA":
            raise DomainException("No se puede cancelar una orden ya entregada. Use RMA.")
        self._status = "CANCELADA"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "order_id": self._order_id,
            "order_code": self._order_code,
            "customer_email": self._customer_email,
            "customer_name": self._customer_name,
            "shipping_address": self._shipping_address.to_dict(),
            "lines": [l.to_dict() for l in self._lines],
            "coupon": self._coupon.to_dict() if self._coupon else None,
            "subtotal": self._subtotal.to_dict(),
            "tax": self._tax.to_dict(),
            "shipping_fee": self._shipping_fee.to_dict(),
            "discount": self._discount.to_dict(),
            "total": self._total.to_dict(),
            "status": self._status,
            "idempotency_key": self._idempotency_key,
            "created_at": self._created_at.isoformat(),
        }
