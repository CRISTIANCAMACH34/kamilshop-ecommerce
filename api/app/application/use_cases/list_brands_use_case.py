from typing import List
from ...domain.entities.brand import Brand
from ...domain.ports.driven.brand_repository_port import IBrandRepositoryPort


class ListBrandsUseCase:
    """Caso de Uso para listar las marcas activas en la plataforma."""

    def __init__(self, brand_repo: IBrandRepositoryPort):
        self._brand_repo = brand_repo

    def execute(self, active_only: bool = True) -> List[Brand]:
        return self._brand_repo.find_all(active_only=active_only)
