"""Módulo de Ciberseguridad Avanzada, Criptografía y RBAC para KAMIL SHOP.

Proporciona:
- Hashing de contraseñas seguro mediante PBKDF2-HMAC-SHA256 con Salt y comparación en tiempo constante (anti-timing attacks).
- Generación y verificación criptográfica de Tokens JWT (HS256) con fecha de expiración (exp) y claims de rol.
- Mapeo y dependencias FastAPI para Control de Acceso Basado en Roles (RBAC) con HTTP Bearer Auth.
- Enmascaramiento y sanitización de datos sensibles para protección de privacidad (Habeas Data / GDPR).
"""

import os
import re
import hmac
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

# Esquema de autenticación HTTP Bearer
security_bearer = HTTPBearer(auto_error=False)

# Algoritmo de firma JWT
JWT_ALGORITHM = "HS256"
DEFAULT_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    """Genera un hash seguro PBKDF2-HMAC-SHA256 con salt de 16 bytes."""
    if salt is None:
        salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        iterations=100000
    )
    return f"pbkdf2:sha256:{salt.hex()}:{key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña plana contra su hash PBKDF2 en tiempo constante."""
    try:
        if not hashed_password.startswith("pbkdf2:sha256:"):
            # Fallback seguro para comparación constante si fuera texto plano antiguo
            return hmac.compare_digest(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

        parts = hashed_password.split(":")
        if len(parts) != 4:
            return False

        salt = bytes.fromhex(parts[2])
        stored_key = bytes.fromhex(parts[3])

        calculated_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            iterations=100000
        )
        return hmac.compare_digest(stored_key, calculated_key)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Genera un token JWT firmado criptográficamente con tiempo de expiración."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=DEFAULT_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": "kamilshop-auth-service"
    })
    
    secret_key = settings.SECRET_KEY or "fallback_kamilshop_ultra_secure_key_2026"
    return jwt.encode(to_encode, secret_key, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica y valida la firma y expiración de un token JWT."""
    try:
        # Remover prefijo Bearer si viene incluido
        clean_token = token.replace("Bearer ", "").strip() if token else ""
        if not clean_token:
            return None
            
        secret_key = settings.SECRET_KEY or "fallback_kamilshop_ultra_secure_key_2026"
        payload = jwt.decode(clean_token, secret_key, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer), authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Extrae y valida el usuario activo a partir del token JWT en el header Authorization."""
    token = None
    if credentials:
        token = credentials.credentials
    elif authorization:
        token = authorization.replace("Bearer ", "").strip()

    if not token:
        return None

    return decode_access_token(token)


def get_current_admin(current_user: Optional[Dict[str, Any]] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependencia de seguridad FastAPI: Exige rol ADMIN y token JWT válido."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticación requerida. Token inválido o ausente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requieren privilegios de Administrador Corporativo.",
        )
        
    return current_user


def mask_email(email: str) -> str:
    """Enmascara una dirección de correo electrónico (ej: c***a@domain.com)."""
    if not email or "@" not in email:
        return "***"
    name, domain = email.split("@", 1)
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"


def mask_phone(phone: str) -> str:
    """Enmascara un número telefónico (ej: +57 300 *** **12)."""
    if not phone:
        return "***"
    digits = re.sub(r"\D", "", phone)
    if len(digits) < 6:
        return "*******"
    return f"+{digits[:2]} {digits[2:5]} *** **{digits[-2:]}"


def sanitize_order_for_public(order: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitiza una orden para consumo público en el endpoint de rastreo."""
    sanitized = order.copy()
    # Ocultar o enmascarar datos de identificación personal sensibles
    if "email" in sanitized and sanitized["email"]:
        sanitized["customer_email_masked"] = mask_email(str(sanitized["email"]))
        sanitized.pop("email", None)
    if "customer_email" in sanitized and sanitized["customer_email"]:
        sanitized["customer_email_masked"] = mask_email(str(sanitized["customer_email"]))
        sanitized.pop("customer_email", None)
        
    if "phone" in sanitized and sanitized["phone"]:
        sanitized["phone_masked"] = mask_phone(str(sanitized["phone"]))
        sanitized.pop("phone", None)
        
    if "address" in sanitized and sanitized["address"]:
        # Dejar solo ciudad y zona general para privacidad de envío
        sanitized["shipping_city"] = sanitized.get("city", "Bogotá")
        sanitized.pop("address", None)
        
    # Eliminar notas internas de administradores y datos bancarios privados
    sanitized.pop("notes", None)
    sanitized.pop("internal_notes", None)
    sanitized.pop("raw_payment_response", None)
    
    return sanitized
