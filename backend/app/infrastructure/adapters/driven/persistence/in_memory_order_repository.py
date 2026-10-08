import threading
from typing import List, Optional, Dict
from .....domain.entities.order import Order
from .....domain.ports.driven.order_repository_port import IOrderRepositoryPort


class InMemoryOrderRepository(IOrderRepositoryPort):
    """Adaptador de persistencia secundario para órdenes con soporte para idempotencia."""

    def __init__(self):
        self._lock = threading.RLock()
        self._orders: Dict[str, Order] = {}
        self._idempotency_map: Dict[str, str] = {}  # idempotency_key -> order_id

    def save(self, order: Order) -> Order:
        with self._lock:
            self._orders[order.order_id] = order
            self._idempotency_map[order.idempotency_key] = order.order_id
            return order

    def find_by_id(self, order_id: str) -> Optional[Order]:
        with self._lock:
            return self._orders.get(order_id)

    def find_by_idempotency_key(self, key: str) -> Optional[Order]:
        with self._lock:
            order_id = self._idempotency_map.get(key)
            if order_id:
                return self._orders.get(order_id)
            return None

    def list_by_customer_email(self, email: str) -> List[Order]:
        with self._lock:
            target = email.strip().lower()
            return [o for o in self._orders.values() if o._customer_email.lower() == target]
