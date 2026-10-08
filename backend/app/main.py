import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from .config import settings
from .infrastructure.adapters.driving.api_v1.products_controller import router as products_router
from .infrastructure.adapters.driving.api_v1.brands_controller import router as brands_router
from .infrastructure.adapters.driving.api_v1.checkout_controller import router as checkout_router
from .infrastructure.adapters.driving.api_v1.orders_controller import router as orders_router
from .infrastructure.adapters.driving.api_v1.admin_controller import router as admin_router
from .infrastructure.adapters.driving.api_v1.auth_controller import router as auth_router
from .infrastructure.adapters.driving.api_v1.admin_dashboard_controller import router as admin_dashboard_router
from .infrastructure.adapters.driving.api_v1.config_controller import router as config_router
from .infrastructure.database import init_db


# In-Memory Rate Limiter para protección Anti-Brute-Force
RATE_LIMIT_STORE = defaultdict(list)
MAX_LOGIN_ATTEMPTS_PER_MINUTE = 10
RATE_LIMIT_WINDOW_SECONDS = 60


def is_rate_limited(client_ip: str, endpoint: str) -> bool:
    """Valida si una IP ha superado el límite de intentos por minuto en endpoints sensibles."""
    key = f"{client_ip}:{endpoint}"
    now = time.time()
    # Filtrar timestamps anteriores a la ventana
    RATE_LIMIT_STORE[key] = [t for t in RATE_LIMIT_STORE[key] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    
    if len(RATE_LIMIT_STORE[key]) >= MAX_LOGIN_ATTEMPTS_PER_MINUTE:
        return True
        
    RATE_LIMIT_STORE[key].append(now)
    return False


def create_app() -> FastAPI:
    """Fábrica de aplicación FastAPI con configuración hexagonal y ciberseguridad avanzada."""
    # Inicializar tablas de base de datos relacionales persistentes
    init_db()

    # Ocultar documentación Swagger/ReDoc en producción si DEBUG es False
    is_prod = settings.APP_ENV.lower() == "production" and not settings.DEBUG
    docs_url = None if is_prod else "/docs"
    redoc_url = None if is_prod else "/redoc"
    openapi_url = None if is_prod else "/openapi.json"

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="""
        ## KAMIL SHOP E-Commerce Enterprise API (Secured)
        API protegida con **Arquitectura Hexagonal (Ports & Adapters)**, **JWT Authentication**, y **Ciberseguridad Avanzada**.
        """,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )

    # Compresión de respuestas HTTP
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Middleware CORS seguro sin comodines peligrosos
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    )

    # Middleware Anti-Brute-Force (Rate Limiting)
    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        path = request.url.path
        if request.method == "POST" and ("/auth/admin/login" in path or "/auth/customer/email-login" in path):
            client_ip = request.client.host if request.client else "127.0.0.1"
            if is_rate_limited(client_ip, path):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Demasiados intentos de autenticación. Por favor, intente de nuevo en 1 minuto.",
                        "error_code": "RATE_LIMIT_EXCEEDED"
                    }
                )
        return await call_next(request)

    # Middleware de Cabeceras de Seguridad (HTTP Hardening & Security Policies)
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; "
            "style-src 'self' 'unsafe-inline' https:; "
            "img-src 'self' data: https:; "
            "font-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        response.headers["X-Powered-By"] = "KAMIL-SHOP-SECURITY-ENGINE"
        return response

    # Registro de rutas de la API v1
    app.include_router(products_router, prefix=settings.API_V1_PREFIX)
    app.include_router(brands_router, prefix=settings.API_V1_PREFIX)
    app.include_router(checkout_router, prefix=settings.API_V1_PREFIX)
    app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
    app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
    app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
    app.include_router(admin_dashboard_router, prefix=settings.API_V1_PREFIX)
    app.include_router(config_router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["Health"])
    def health_check():
        from .infrastructure.adapters.driven.cache.redis_cache import cache_manager
        from .infrastructure.celery_app import celery_app
        return {
            "status": "HEALTHY",
            "service": "KAMIL SHOP Backend",
            "architecture": "Hexagonal (Ports and Adapters)",
            "paradigm": "Pure OOP & SOLID",
            "security_hardened": True,
            "jwt_rbac_enabled": True,
            "rate_limiter_active": True,
            "redis_cache_online": cache_manager.is_healthy(),
            "celery_broker_configured": celery_app is not None,
            "version": settings.VERSION,
        }

    return app


app = create_app()
