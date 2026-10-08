import re
from ..exceptions import DomainException


class Email:
    """Value Object inmutable para direcciones de correo electrónico normalizadas."""

    __slots__ = ("_address",)
    _REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

    def __init__(self, address: str):
        sanitized = str(address).strip().lower()
        if not self._REGEX.match(sanitized):
            raise DomainException(
                f"Dirección de correo electrónico inválida: '{address}'.",
                code="INVALID_EMAIL_FORMAT"
            )
        object.__setattr__(self, "_address", sanitized)

    @property
    def value(self) -> str:
        return self._address

    def __setattr__(self, name, value):
        raise AttributeError("Email es inmutable.")

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Email):
            return False
        return self._address == other.value

    def __repr__(self) -> str:
        return f"Email('{self._address}')"

    def __str__(self) -> str:
        return self._address
