from typing import List, Optional
from ...domain.entities.product import ProductBase
from ...domain.ports.driven.product_repository_port import IProductRepositoryPort


class ListProductsUseCase:
    """Caso de Uso para listar y filtrar prendas con criterios de género, estilo, marca y búsqueda."""

    def __init__(self, product_repo: IProductRepositoryPort):
        self._product_repo = product_repo

    def execute(
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
        return self._product_repo.find_all(
            gender=gender,
            category=category,
            brand=brand,
            brand_id=brand_id,
            style=style,
            min_price=min_price,
            max_price=max_price,
            in_stock_only=in_stock_only,
            color=color,
            size=size,
            badge=badge,
            search=search,
        )
