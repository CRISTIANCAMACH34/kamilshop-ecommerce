import re
from ..exceptions import DomainException


class SKU:
    """Value Object inmutable que representa un código SKU normalizado."""

    __slots__ = ("_code",)
    _PATTERN = re.compile(r"^[A-Z0-9_-]{3,50}$")

    def __init__(self, code: str):
        sanitized = str(code).strip().upper()
        if not self._PATTERN.match(sanitized):
            raise DomainException(
                f"Formato de SKU inválido '{code}'. Debe ser alfanumérico en mayúsculas de 3 a 50 caracteres.",
                code="INVALID_SKU_FORMAT"
            )
        object.__setattr__(self, "_code", sanitized)

    @property
    def value(self) -> str:
        return self._code

    def __setattr__(self, name, value):
        raise AttributeError("SKU es inmutable.")

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, SKU):
            return False
        return self._code == other.value

    def __repr__(self) -> str:
        return f"SKU('{self._code}')"

    def __str__(self) -> str:
        return self._code
