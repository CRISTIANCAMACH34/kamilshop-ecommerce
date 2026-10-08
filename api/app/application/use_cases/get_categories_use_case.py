from typing import List
from ...domain.ports.driven.product_repository_port import IProductRepositoryPort


class GetCategoriesUseCase:
    """Caso de Uso para obtener el catálogo dinámico de categorías y su inventario."""

    def __init__(self, product_repo: IProductRepositoryPort):
        self._product_repo = product_repo

    def execute(self) -> List[dict]:
        return self._product_repo.get_categories_summary()
