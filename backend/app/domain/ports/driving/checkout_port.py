from abc import ABC, abstractmethod
from typing import Dict, Any
from ...entities.order import Order


class ICheckoutPort(ABC):
    """Puerto de Entrada (Driving Port) para el procesamiento transaccional ACID de Checkout."""

    @abstractmethod
    def process_checkout(self, checkout_data: Dict[str, Any]) -> Order:
        pass
