from decimal import Decimal
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from ..value_objects.money import Money
from ..exceptions import InvalidCouponException


class Coupon:
    """Entidad POO de Cupón de Descuento Promocional."""

    def __init__(
        self,
        coupon_id: int,
        code: str,
        description: str,
        discount_percent: Decimal,
        start_date: datetime,
        end_date: datetime,
        min_purchase_amount: Optional[Money] = None,
        max_uses: Optional[int] = None,
        current_uses: int = 0,
        is_active: bool = True,
    ):
        if discount_percent <= Decimal("0.00") or discount_percent > Decimal("100.00"):
            raise InvalidCouponException(code, "El porcentaje de descuento debe ser mayor a 0 y menor o igual a 100.")
        if start_date >= end_date:
            raise InvalidCouponException(code, "La fecha de inicio debe ser anterior a la fecha de expiración.")

        self._coupon_id = coupon_id
        self._code = code.strip().upper()
        self._description = description.strip()
        self._discount_percent = discount_percent
        self._start_date = start_date
        self._end_date = end_date
        self._min_purchase_amount = min_purchase_amount
        self._max_uses = max_uses
        self._current_uses = current_uses
        self._is_active = is_active

    @property
    def coupon_id(self) -> int:
        return self._coupon_id

    @property
    def code(self) -> str:
        return self._code

    @property
    def discount_percent(self) -> Decimal:
        return self._discount_percent

    @property
    def current_uses(self) -> int:
        return self._current_uses

    def is_valid(self, subtotal: Money) -> bool:
        if not self._is_active:
            raise InvalidCouponException(self._code, "El cupón se encuentra inactivo.")

        now = datetime.now(timezone.utc)
        start_tz = self._start_date if self._start_date.tzinfo else self._start_date.replace(tzinfo=timezone.utc)
        end_tz = self._end_date if self._end_date.tzinfo else self._end_date.replace(tzinfo=timezone.utc)

        if now < start_tz or now > end_tz:
            raise InvalidCouponException(self._code, "El cupón ha expirado o no ha entrado en vigencia.")

        if self._max_uses is not None and self._current_uses >= self._max_uses:
            raise InvalidCouponException(self._code, "El cupón ha alcanzado el límite de usos permitidos.")

        if self._min_purchase_amount is not None and subtotal.amount < self._min_purchase_amount.amount:
            raise InvalidCouponException(
                self._code,
                f"Compra mínima requerida de {self._min_purchase_amount.amount} {self._min_purchase_amount.currency}."
            )

        return True

    def calculate_discount(self, subtotal: Money) -> Money:
        self.is_valid(subtotal)
        return subtotal.apply_percentage(self._discount_percent)

    def increment_usage(self) -> None:
        self._current_uses += 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "coupon_id": self._coupon_id,
            "code": self._code,
            "description": self._description,
            "discount_percent": float(self._discount_percent),
            "current_uses": self._current_uses,
            "is_active": self._is_active,
        }
