from decimal import Decimal, ROUND_HALF_UP
from typing import Union
from ..exceptions import InvalidMoneyOperationException


class Money:
    """Value Object inmutable que representa cantidades monetarias con precisión atómica."""

    __slots__ = ("_amount", "_currency")

    def __init__(self, amount: Union[int, float, str, Decimal], currency: str = "COP"):
        dec_amount = Decimal(str(amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if dec_amount < Decimal("0.00"):
            raise InvalidMoneyOperationException("El monto monetario no puede ser negativo.")

        object.__setattr__(self, "_amount", dec_amount)
        object.__setattr__(self, "_currency", currency.upper())

    @property
    def amount(self) -> Decimal:
        return self._amount

    @property
    def currency(self) -> str:
        return self._currency

    def add(self, other: "Money") -> "Money":
        self._check_currency(other)
        return Money(self._amount + other.amount, self._currency)

    def subtract(self, other: "Money") -> "Money":
        self._check_currency(other)
        if other.amount > self._amount:
            raise InvalidMoneyOperationException(
                f"Sustracción monetaria resultaría en saldo negativo: {self._amount} - {other.amount}"
            )
        return Money(self._amount - other.amount, self._currency)

    def multiply(self, factor: Union[int, float, Decimal]) -> "Money":
        dec_factor = Decimal(str(factor))
        if dec_factor < Decimal("0.00"):
            raise InvalidMoneyOperationException("El factor de multiplicación no puede ser negativo.")
        return Money(self._amount * dec_factor, self._currency)

    def apply_percentage(self, percent: Union[int, float, Decimal]) -> "Money":
        dec_percent = Decimal(str(percent))
        if dec_percent < Decimal("0.00") or dec_percent > Decimal("100.00"):
            raise InvalidMoneyOperationException("El porcentaje debe estar entre 0.00 y 100.00.")
        return Money((self._amount * dec_percent) / Decimal("100.00"), self._currency)

    def _check_currency(self, other: "Money") -> None:
        if not isinstance(other, Money):
            raise InvalidMoneyOperationException("La operación requiere otro objeto de tipo Money.")
        if self._currency != other.currency:
            raise InvalidMoneyOperationException(
                f"Discrepancia de monedas: {self._currency} vs {other.currency}."
            )

    def __setattr__(self, name, value):
        raise AttributeError("Money es un Value Object inmutable.")

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return False
        return self._amount == other.amount and self._currency == other.currency

    def __repr__(self) -> str:
        return f"Money({self._amount}, '{self._currency}')"

    def to_float(self) -> float:
        return float(self._amount)

    def to_dict(self) -> dict:
        return {"amount": float(self._amount), "currency": self._currency}
