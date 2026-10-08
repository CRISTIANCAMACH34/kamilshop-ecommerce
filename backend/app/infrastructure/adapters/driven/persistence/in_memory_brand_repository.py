import threading
from typing import List, Optional, Dict
from .....domain.entities.brand import Brand
from .....domain.ports.driven.brand_repository_port import IBrandRepositoryPort


class InMemoryBrandRepository(IBrandRepositoryPort):
    """Adaptador de persistencia secundario para marcas y casas de moda con índices O(1) e interoperabilidad int/str."""

    def __init__(self):
        self._lock = threading.RLock()
        self._brands: Dict[int, Brand] = {}
        self._code_index: Dict[str, Brand] = {}

    def find_all(self, active_only: bool = True) -> List[Brand]:
        with self._lock:
            if active_only:
                return [b for b in self._brands.values() if b.is_active]
            return list(self._brands.values())

    def find_by_id(self, brand_id: int) -> Optional[Brand]:
        with self._lock:
            res = self._brands.get(brand_id)
            if res is None:
                try:
                    res = self._brands.get(int(brand_id))
                except (ValueError, TypeError):
                    pass
            return res

    def find_by_code(self, code: str) -> Optional[Brand]:
        with self._lock:
            target = code.strip().upper()
            return self._code_index.get(target)

    def save(self, brand: Brand) -> Brand:
        with self._lock:
            self._brands[brand.brand_id] = brand
            if brand.code:
                self._code_index[brand.code.strip().upper()] = brand
            return brand

    def delete(self, brand_id: int) -> bool:
        with self._lock:
            target_id = brand_id
            if target_id not in self._brands:
                try:
                    target_id = int(brand_id)
                except (ValueError, TypeError):
                    pass
            brand = self._brands.pop(target_id, None)
            if brand and brand.code:
                self._code_index.pop(brand.code.strip().upper(), None)
            return brand is not None
