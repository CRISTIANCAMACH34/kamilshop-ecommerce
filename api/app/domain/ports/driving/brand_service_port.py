from abc import ABC, abstractmethod
from typing import List
from ...entities.brand import Brand


class IBrandServicePort(ABC):
    """Puerto de Entrada (Driving Port) para consulta y gestión de marcas de moda."""

    @abstractmethod
    def list_brands(self, active_only: bool = True) -> List[Brand]:
        pass

    @abstractmethod
    def get_brand_by_id(self, brand_id: int) -> Brand:
        pass
