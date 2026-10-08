import hashlib
import uuid
from typing import Dict, Any
from datetime import datetime, timezone
from .....domain.ports.driven.payment_gateway_port import IPaymentGatewayPort
from .....domain.value_objects.money import Money


class MockAcidPaymentGateway(IPaymentGatewayPort):
    """Adaptador de pasarela de pagos simulada con cálculo de firma digital SHA-256."""

    def __init__(self, secret_key: str = "TITULO_SECRET_GATEWAY_KEY_2026"):
        self._secret_key = secret_key

    def charge(
        self,
        order_id: str,
        amount: Money,
        payment_method: str,
        idempotency_key: str,
    ) -> Dict[str, Any]:
        transaction_ref = f"TX-{uuid.uuid4().hex[:12].upper()}"

        # Cálculo de firma criptográfica
        signature_raw = f"{self._secret_key}:{order_id}:{amount.amount}:{amount.currency}:{idempotency_key}"
        digital_signature = hashlib.sha256(signature_raw.encode("utf-8")).hexdigest()

        return {
            "status": "APROBADO",
            "transaction_reference": transaction_ref,
            "order_id": order_id,
            "amount": float(amount.amount),
            "currency": amount.currency,
            "payment_method": payment_method,
            "digital_signature_sha256": digital_signature,
            "authorized_at": datetime.now(timezone.utc).isoformat(),
        }
