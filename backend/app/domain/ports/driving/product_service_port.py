from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ...entities.product import ProductBase


class IProductServicePort(ABC):
    """Puerto de Entrada (Driving Port) para consulta y gestión del catálogo de indumentaria."""

    @abstractmethod
    def list_products(
        self,
        gender: Optional[str] = None,
        style: Optional[str] = None,
        brand_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[ProductBase]:
        pass

    @abstractmethod
    def get_product_by_id_or_slug(self, identifier: str) -> ProductBase:
        pass

    @abstractmethod
    def create_product(self, data: Dict[str, Any]) -> ProductBase:
        pass

    @abstractmethod
    def update_product(self, product_id: str, data: Dict[str, Any]) -> ProductBase:
        pass

    @abstractmethod
    def delete_product(self, product_id: str) -> bool:
        pass
