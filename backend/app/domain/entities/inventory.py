from typing import Dict, Any, Optional
from datetime import datetime, timezone


class KardexMovement:
    """Entidad POO de Kardex inmutable para trazabilidad de inventario."""

    VALID_TYPES = {
        "ENTRADA_COMPRA",
        "SALIDA_VENTA",
        "RESERVA_CHECKOUT",
        "LIBERACION_RESERVA",
        "DEVOLUCION_CLIENTE",
        "AJUSTE_MERMA",
    }

    def __init__(
        self,
        movement_id: str,
        variant_id: str,
        warehouse_id: int,
        movement_type: str,
        units: int,
        resulting_balance: int,
        reason: str,
        operator_user_id: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ):
        if movement_type not in self.VALID_TYPES:
            raise ValueError(f"Tipo de movimiento '{movement_type}' inválido.")

        self._movement_id = movement_id
        self._variant_id = variant_id
        self._warehouse_id = warehouse_id
        self._movement_type = movement_type
        self._units = units
        self._resulting_balance = resulting_balance
        self._reason = reason
        self._operator_user_id = operator_user_id
        self._timestamp = timestamp or datetime.now(timezone.utc)

    @property
    def movement_id(self) -> str:
        return self._movement_id

    @property
    def variant_id(self) -> str:
        return self._variant_id

    @property
    def units(self) -> int:
        return self._units

    @property
    def resulting_balance(self) -> int:
        return self._resulting_balance

    def to_dict(self) -> Dict[str, Any]:
        return {
            "movement_id": self._movement_id,
            "variant_id": self._variant_id,
            "warehouse_id": self._warehouse_id,
            "movement_type": self._movement_type,
            "units": self._units,
            "resulting_balance": self._resulting_balance,
            "reason": self._reason,
            "operator_user_id": self._operator_user_id,
            "timestamp": self._timestamp.isoformat(),
        }
