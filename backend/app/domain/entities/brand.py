from typing import Optional, Dict, Any
from ..exceptions import DomainException


class Brand:
    """Entidad POO de Dominio que modela una Marca o Casa de Moda."""

    def __init__(
        self,
        brand_id: int,
        code: str,
        commercial_name: str,
        country_origin: str,
        website_url: Optional[str] = None,
        biography: Optional[str] = None,
        is_own_brand: bool = False,
        is_active: bool = True,
    ):
        if not commercial_name or len(commercial_name.strip()) < 2:
            raise DomainException("El nombre comercial de la marca debe tener al menos 2 caracteres.")
        if not code or len(code.strip()) < 2:
            raise DomainException("El código identificador de la marca es obligatorio.")

        self._brand_id = brand_id
        self._code = code.strip().upper()
        self._commercial_name = commercial_name.strip()
        self._country_origin = country_origin.strip()
        self._website_url = website_url.strip() if website_url else None
        self._biography = biography.strip() if biography else None
        self._is_own_brand = is_own_brand
        self._is_active = is_active

    @property
    def brand_id(self) -> int:
        return self._brand_id

    @property
    def code(self) -> str:
        return self._code

    @property
    def commercial_name(self) -> str:
        return self._commercial_name

    @property
    def country_origin(self) -> str:
        return self._country_origin

    @property
    def website_url(self) -> Optional[str]:
        return self._website_url

    @property
    def biography(self) -> Optional[str]:
        return self._biography

    @property
    def is_own_brand(self) -> bool:
        return self._is_own_brand

    @property
    def is_active(self) -> bool:
        return self._is_active

    def activate(self) -> None:
        self._is_active = True

    def deactivate(self) -> None:
        self._is_active = False

    def update_biography(self, new_bio: str) -> None:
        if not new_bio or len(new_bio.strip()) < 10:
            raise DomainException("La biografía de la marca debe tener al menos 10 caracteres.")
        self._biography = new_bio.strip()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "brand_id": self._brand_id,
            "code": self._code,
            "commercial_name": self._commercial_name,
            "country_origin": self._country_origin,
            "website_url": self._website_url,
            "biography": self._biography,
            "is_own_brand": self._is_own_brand,
            "is_active": self._is_active,
        }

    def __repr__(self) -> str:
        return f"<Brand id={self._brand_id} code='{self._code}' name='{self._commercial_name}'>"
