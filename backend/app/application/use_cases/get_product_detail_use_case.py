from ...domain.entities.product import ProductBase
from ...domain.ports.driven.product_repository_port import IProductRepositoryPort
from ...domain.exceptions import ProductNotFoundException


class GetProductDetailUseCase:
    """Caso de Uso para obtener el detalle atómico de un producto por ID o Slug."""

    def __init__(self, product_repo: IProductRepositoryPort):
        self._product_repo = product_repo

    def execute(self, identifier: str) -> ProductBase:
        # Intenta primero por ID
        product = self._product_repo.find_by_id(identifier)
        if not product:
            # Luego por Slug
            product = self._product_repo.find_by_slug(identifier)

        if not product:
            raise ProductNotFoundException(identifier)

        return product
