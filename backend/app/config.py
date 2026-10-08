from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
from pydantic import field_validator


class Settings(BaseSettings):
    """Configuración centralizada y tipada para KAMIL SHOP con validación de seguridad."""
    
    # 1. Aplicación
    PROJECT_NAME: str = "KAMIL SHOP API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    APP_ENV: str = "production"
    DEBUG: bool = False
    SECRET_KEY: str = "kamilshop_prod_secret_key_ultra_secure_hash_2026_xyz"
    DOMAIN_NAME: str = "localhost"
    SSL_EMAIL: str = "admin@kamilshop.store"
    
    # CORS: Filtrado estricto de orígenes permitidos
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost",
        "https://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "capacitor://localhost",
        "ionic://localhost",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            origins = [i.strip() for i in v.split(",") if i.strip() and i.strip() != "*"]
            return origins or ["http://localhost:5173", "http://localhost:8000"]
        elif isinstance(v, list):
            return [o for o in v if o != "*"]
        return ["http://localhost:5173", "http://localhost:8000"]

    # 2. Base de Datos (PostgreSQL 16)
    DATABASE_URL: str = "postgresql://kamilshop_admin:kamilshop_secure_db_pass_2026@postgres:5432/kamilshop_ecommerce"
    POSTGRES_DB: str = "kamilshop_ecommerce"
    POSTGRES_USER: str = "kamilshop_admin"
    POSTGRES_PASSWORD: str = "kamilshop_secure_db_pass_2026"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432

    # 3. Redis Cache & Celery
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "kamilshop_redis_secret_2026"
    REDIS_CACHE_URL: str = "redis://:kamilshop_redis_secret_2026@redis:6379/2"
    CACHE_DEFAULT_TTL_SECONDS: int = 300
    CELERY_BROKER_URL: str = "redis://:kamilshop_redis_secret_2026@redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://:kamilshop_redis_secret_2026@redis:6379/1"

    # 4. Wompi Colombia
    WOMPI_ENVIRONMENT: str = "sandbox"
    WOMPI_PUBLIC_KEY: str = ""
    WOMPI_PRIVATE_KEY: str = ""
    WOMPI_INTEGRITY_SECRET: str = ""
    WOMPI_EVENT_SECRET: str = ""
    WOMPI_API_URL: str = "https://sandbox.wompi.co/v1"

    # 5. Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost/api/v1/auth/google/callback"

    # 6. Apple ID
    APPLE_TEAM_ID: str = ""
    APPLE_CLIENT_ID: str = "com.kamilshop.ecommerce.signin"
    APPLE_KEY_ID: str = ""
    APPLE_PRIVATE_KEY: str = ""
    APPLE_REDIRECT_URI: str = "http://localhost/api/v1/auth/apple/callback"

    # 7. Facebook Login
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    FACEBOOK_REDIRECT_URI: str = "http://localhost/api/v1/auth/facebook/callback"

    # 8. SMTP Email (Hostinger)
    SMTP_HOST: str = "smtp.hostinger.com"
    SMTP_PORT: int = 465
    SMTP_USER: str = "notificaciones@kamilshop.store"
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "notificaciones@kamilshop.store"
    SMTP_FROM_NAME: str = "KAMIL SHOP"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
