import uuid
from fastapi import APIRouter, HTTPException, status, Header
from typing import Optional
from .....application.dtos.auth_dto import (
    SocialLoginRequestDTO,
    CustomerEmailLoginRequestDTO,
    AdminLoginRequestDTO,
    AuthUserResponseDTO,
)
from app.config import settings
from app.infrastructure.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

# Base de datos simulada de administradores corporativos internos con contraseñas compuestas/hasheadas
INTERNAL_ADMINS = {
    "admin@kamilshop.store": {
        "id": "usr-admin-001",
        "username": "admin",
        "name": "Administrador Principal Kamil Shop",
        "email": "admin@kamilshop.store",
        "password_hash": hash_password("admin2026"),
        "role": "ADMIN",
        "provider": "internal_corporate",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    "admin@camilaytio.store": {
        "id": "usr-admin-001",
        "username": "admin",
        "name": "Administrador Kamil Shop",
        "email": "admin@camilaytio.store",
        "password_hash": hash_password("admin2026"),
        "role": "ADMIN",
        "provider": "internal_corporate",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    "admin@titulo.store": {
        "id": "usr-admin-legacy",
        "username": "admin_legacy",
        "name": "Administrador Legacy",
        "email": "admin@titulo.store",
        "password_hash": hash_password("admin2026"),
        "role": "ADMIN",
        "provider": "internal_corporate",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
}


@router.get("/providers")
def get_auth_and_payment_providers():
    """Retorna el estado de disponibilidad y configuración de los proveedores OAuth y pasarelas."""
    return {
        "oauth": {
            "google": {
                "enabled": bool(settings.GOOGLE_CLIENT_ID),
                "client_id": settings.GOOGLE_CLIENT_ID or None,
            },
            "apple": {
                "enabled": bool(settings.APPLE_CLIENT_ID and settings.APPLE_KEY_ID),
                "client_id": settings.APPLE_CLIENT_ID,
            },
            "facebook": {
                "enabled": bool(settings.FACEBOOK_APP_ID),
                "app_id": settings.FACEBOOK_APP_ID or None,
            },
        },
        "wompi": {
            "enabled": bool(settings.WOMPI_PUBLIC_KEY),
            "environment": settings.WOMPI_ENVIRONMENT,
            "public_key": settings.WOMPI_PUBLIC_KEY or None,
        },
        "smtp": {
            "configured": bool(settings.SMTP_PASSWORD),
            "host": settings.SMTP_HOST,
        }
    }


@router.post("/customer/social-login", response_model=AuthUserResponseDTO)
def customer_social_login(payload: SocialLoginRequestDTO):
    """Inicio de sesión social para CLIENTES mediante Google, Apple o Facebook."""
    user_id = f"cust-{payload.provider}-{uuid.uuid4().hex[:8]}"
    
    token_data = {
        "sub": user_id,
        "email": payload.email,
        "name": payload.name,
        "role": "CLIENTE",
        "provider": payload.provider
    }
    jwt_token = create_access_token(token_data)

    return AuthUserResponseDTO(
        id=user_id,
        name=payload.name,
        email=payload.email,
        role="CLIENTE",
        provider=payload.provider,
        avatar_url=payload.avatar_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={payload.email}",
        access_token=jwt_token,
    )


@router.post("/customer/email-login", response_model=AuthUserResponseDTO)
def customer_email_login(payload: CustomerEmailLoginRequestDTO):
    """Inicio de sesión tradicional con correo y contraseña para CLIENTES."""
    user_id = f"cust-email-{uuid.uuid4().hex[:8]}"
    user_name = payload.email.split("@")[0].capitalize()

    token_data = {
        "sub": user_id,
        "email": payload.email,
        "name": user_name,
        "role": "CLIENTE",
        "provider": "email_password"
    }
    jwt_token = create_access_token(token_data)

    return AuthUserResponseDTO(
        id=user_id,
        name=user_name,
        email=payload.email,
        role="CLIENTE",
        provider="email_password",
        avatar_url=f"https://api.dicebear.com/7.x/identicon/svg?seed={payload.email}",
        access_token=jwt_token,
    )


@router.post("/admin/login", response_model=AuthUserResponseDTO)
def admin_login(payload: AdminLoginRequestDTO):
    """Inicio de sesión exclusivo para ADMINISTRADORES con credenciales internas verificadas."""
    identifier = payload.username_or_email.strip().lower()
    admin_record = None

    for adm in INTERNAL_ADMINS.values():
        if adm["email"].lower() == identifier or adm["username"].lower() == identifier:
            admin_record = adm
            break

    if not admin_record or not verify_password(payload.password, admin_record["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales corporativas inválidas. Acceso restringido al personal de TITULO.",
        )

    token_data = {
        "sub": admin_record["id"],
        "email": admin_record["email"],
        "name": admin_record["name"],
        "role": "ADMIN",
        "provider": admin_record["provider"]
    }
    jwt_token = create_access_token(token_data)

    return AuthUserResponseDTO(
        id=admin_record["id"],
        name=admin_record["name"],
        email=admin_record["email"],
        role=admin_record["role"],
        provider=admin_record["provider"],
        avatar_url=admin_record["avatar_url"],
        access_token=jwt_token,
    )


@router.get("/me")
def get_current_user_profile(authorization: Optional[str] = Header(None)):
    """Verifica criptográficamente la sesión JWT y los permisos del usuario activo."""
    if not authorization:
        return {"authenticated": False, "role": "GUEST"}

    payload = decode_access_token(authorization)
    if not payload:
        return {"authenticated": False, "role": "GUEST", "error": "Invalid or expired token"}

    return {
        "authenticated": True,
        "id": payload.get("sub"),
        "name": payload.get("name"),
        "email": payload.get("email"),
        "role": payload.get("role", "CLIENTE"),
        "provider": payload.get("provider"),
    }
