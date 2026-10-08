from abc import ABC, abstractmethod
from typing import List, Optional
from ...entities.brand import Brand


class IBrandRepositoryPort(ABC):
    """Puerto de Salida (Driven Port) para persistencia de marcas."""

    @abstractmethod
    def find_all(self, active_only: bool = True) -> List[Brand]:
        pass

    @abstractmethod
    def find_by_id(self, brand_id: int) -> Optional[Brand]:
        pass

    @abstractmethod
    def find_by_code(self, code: str) -> Optional[Brand]:
        pass

    @abstractmethod
    def save(self, brand: Brand) -> Brand:
        pass

    @abstractmethod
    def delete(self, brand_id: int) -> bool:
        pass
