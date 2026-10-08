from abc import ABC, abstractmethod
from typing import List, Optional
from ...entities.product import ProductBase


class IProductRepositoryPort(ABC):
    """Puerto de Salida (Driven Port) para persistencia de productos y variantes."""

    @abstractmethod
    def find_all(
        self,
        gender: Optional[str] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        brand_id: Optional[int] = None,
        style: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock_only: Optional[bool] = None,
        color: Optional[str] = None,
        size: Optional[str] = None,
        badge: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ProductBase]:
        pass

    @abstractmethod
    def get_categories_summary(self) -> List[dict]:
        """Obtiene el listado consolidado de categorías con conteo de prendas activas."""
        pass

    @abstractmethod
    def get_brands_summary(self) -> List[dict]:
        """Obtiene el listado consolidado de marcas con conteo de prendas en catálogo."""
        pass

    @abstractmethod
    def find_by_id(self, product_id: str) -> Optional[ProductBase]:
        pass

    @abstractmethod
    def find_by_slug(self, slug: str) -> Optional[ProductBase]:
        pass

    @abstractmethod
    def save(self, product: ProductBase) -> ProductBase:
        pass

    @abstractmethod
    def delete(self, product_id: str) -> bool:
        pass
