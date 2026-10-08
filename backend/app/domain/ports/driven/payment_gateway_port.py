from abc import ABC, abstractmethod
from typing import Dict, Any
from ...value_objects.money import Money


class IPaymentGatewayPort(ABC):
    """Puerto de Salida (Driven Port) para procesamiento de cobros con pasarelas de pago."""

    @abstractmethod
    def charge(
        self,
        order_id: str,
        amount: Money,
        payment_method: str,
        idempotency_key: str,
    ) -> Dict[str, Any]:
        """Ejecuta el cargo financiero devolviendo los metadatos y la firma criptográfica."""
        pass
