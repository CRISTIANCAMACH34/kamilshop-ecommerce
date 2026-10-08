from abc import ABC, abstractmethod
from typing import Optional, List
from ...entities.order import Order


class IOrderRepositoryPort(ABC):
    """Puerto de Salida (Driven Port) para persistencia de órdenes con soporte de idempotencia."""

    @abstractmethod
    def save(self, order: Order) -> Order:
        pass

    @abstractmethod
    def find_by_id(self, order_id: str) -> Optional[Order]:
        pass

    @abstractmethod
    def find_by_idempotency_key(self, key: str) -> Optional[Order]:
        pass

    @abstractmethod
    def list_by_customer_email(self, email: str) -> List[Order]:
        pass
