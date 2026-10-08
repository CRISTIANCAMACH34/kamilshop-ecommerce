from typing import Optional
from dataclasses import dataclass
from ..exceptions import DomainException


@dataclass(frozen=True)
class AddressVO:
    """Value Object inmutable que modela una dirección física con desglose atómico en 5NF."""

    country_iso: str
    state_subdivision: str
    city: str
    street_type: str
    street_name: str
    exterior_number: str
    postal_code: str
    interior_number: Optional[str] = None
    neighborhood: Optional[str] = None
    reference: Optional[str] = None

    def __post_init__(self):
        if not self.country_iso or len(self.country_iso) != 2:
            raise DomainException("El código ISO del país debe contener 2 caracteres (Alfa-2).")
        if not self.city or not self.street_name or not self.exterior_number:
            raise DomainException("La dirección debe contener al menos ciudad, vía y número exterior.")

    def format_single_line(self) -> str:
        parts = [f"{self.street_type} {self.street_name} #{self.exterior_number}"]
        if self.interior_number:
            parts.append(f"Apto/Int {self.interior_number}")
        if self.neighborhood:
            parts.append(self.neighborhood)
        parts.append(f"{self.city}, {self.state_subdivision}")
        parts.append(f"CP {self.postal_code}, {self.country_iso}")
        return ", ".join(parts)

    def to_dict(self) -> dict:
        return {
            "country_iso": self.country_iso,
            "state_subdivision": self.state_subdivision,
            "city": self.city,
            "street_type": self.street_type,
            "street_name": self.street_name,
            "exterior_number": self.exterior_number,
            "interior_number": self.interior_number,
            "neighborhood": self.neighborhood,
            "postal_code": self.postal_code,
            "reference": self.reference,
            "formatted": self.format_single_line(),
        }
