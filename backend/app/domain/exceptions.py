"""Excepciones de dominio ricas con semántica de negocio."""

class DomainException(Exception):
    """Excepción base para violaciones de reglas de negocio en el dominio."""
    def __init__(self, message: str, code: str = "DOMAIN_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code


class InsufficientStockException(DomainException):
    def __init__(self, sku: str, requested: int, available: int):
        super().__init__(
            f"Stock insuficiente para SKU '{sku}': solicitado {requested}, disponible {available}.",
            code="INSUFFICIENT_STOCK"
        )
        self.sku = sku
        self.requested = requested
        self.available = available


class InvalidCouponException(DomainException):
    def __init__(self, code: str, reason: str):
        super().__init__(f"Cupón '{code}' inválido: {reason}.", code="INVALID_COUPON")
        self.coupon_code = code


class ProductNotFoundException(DomainException):
    def __init__(self, identifier: str):
        super().__init__(f"Producto con identificador '{identifier}' no fue encontrado.", code="PRODUCT_NOT_FOUND")


class BrandNotFoundException(DomainException):
    def __init__(self, identifier: str):
        super().__init__(f"Marca con identificador '{identifier}' no fue encontrada.", code="BRAND_NOT_FOUND")


class IdempotencyConflictException(DomainException):
    def __init__(self, idempotency_key: str):
        super().__init__(
            f"Conflicto de idempotencia: La clave '{idempotency_key}' ya ha sido procesada previamente.",
            code="IDEMPOTENCY_CONFLICT"
        )
        self.idempotency_key = idempotency_key


class InvalidMoneyOperationException(DomainException):
    def __init__(self, reason: str):
        super().__init__(f"Operación monetaria inválida: {reason}", code="INVALID_MONEY_OPERATION")
