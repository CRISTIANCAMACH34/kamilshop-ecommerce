import json
import logging
import time
from typing import Any, Optional, Callable
from functools import wraps

try:
    import redis
except ImportError:
    redis = None

from app.config import settings

logger = logging.getLogger("kamilshop.cache")


class RedisCacheManager:
    """Gestor de caché Redis empresarial para KAMIL SHOP.
    
    Implementa resiliencia y degradación elegante: si el servidor Redis no está
    disponible temporalmente, la aplicación continúa respondiendo desde la base de datos
    con un Circuit Breaker para evitar penalizaciones de latencia por timeouts.
    """

    def __init__(self):
        self._client: Optional[Any] = None
        self._last_attempt: float = 0.0
        self._cooldown: float = 60.0
        self._init_client()

    def _init_client(self):
        if not redis:
            logger.warning("[Cache] La librería redis no está instalada. Caché en memoria deshabilitada.")
            return

        self._last_attempt = time.time()
        try:
            self._client = redis.Redis.from_url(
                settings.REDIS_CACHE_URL,
                decode_responses=True,
                socket_timeout=0.3,
                socket_connect_timeout=0.3,
            )
            # Prueba de conexión rápida
            self._client.ping()
            logger.info("[Cache] Conectado exitosamente a Redis Cache en %s", settings.REDIS_CACHE_URL)
        except Exception as e:
            logger.warning("[Cache] No se pudo conectar a Redis en el inicio (%s). Modo passthrough activo.", str(e))
            self._client = None

    @property
    def client(self) -> Optional[Any]:
        if self._client is None and redis:
            now = time.time()
            if (now - self._last_attempt) < self._cooldown:
                return None
            self._last_attempt = now
            try:
                self._client = redis.Redis.from_url(
                    settings.REDIS_CACHE_URL,
                    decode_responses=True,
                    socket_timeout=0.3,
                    socket_connect_timeout=0.3,
                )
                self._client.ping()
            except Exception:
                self._client = None
        return self._client

    def get(self, key: str) -> Optional[Any]:
        """Obtiene un valor deserializado desde Redis."""
        c = self.client
        if not c:
            return None
        try:
            val = c.get(key)
            if val is not None:
                return json.loads(val)
        except Exception as e:
            logger.debug("[Cache Error] Fallo al leer clave '%s': %s", key, str(e))
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Serializa y almacena un valor en Redis con tiempo de expiración (TTL)."""
        c = self.client
        if not c:
            return False
        try:
            ttl_seconds = ttl if ttl is not None else settings.CACHE_DEFAULT_TTL_SECONDS
            serialized = json.dumps(value, default=str)
            return bool(c.setex(key, ttl_seconds, serialized))
        except Exception as e:
            logger.debug("[Cache Error] Fallo al guardar clave '%s': %s", key, str(e))
            return False

    def delete(self, key: str) -> bool:
        """Elimina una clave específica."""
        c = self.client
        if not c:
            return False
        try:
            return bool(c.delete(key))
        except Exception as e:
            logger.debug("[Cache Error] Fallo al eliminar clave '%s': %s", key, str(e))
            return False

    def invalidate_prefix(self, prefix: str) -> int:
        """Invalida todas las claves que coincidan con un prefijo (ej: 'catalog:*')."""
        c = self.client
        if not c:
            return 0
        try:
            keys = c.keys(f"{prefix}*")
            if keys:
                return c.delete(*keys)
        except Exception as e:
            logger.debug("[Cache Error] Fallo al invalidar prefijo '%s': %s", prefix, str(e))
        return 0

    def is_healthy(self) -> bool:
        """Verifica si el nodo Redis responde activamente."""
        c = self.client
        if not c:
            return False
        try:
            return bool(c.ping())
        except Exception:
            return False


# Instancia singleton del gestor de caché
cache_manager = RedisCacheManager()


def cached(prefix: str, ttl: Optional[int] = None):
    """Decorador para cachear respuestas de controladores o casos de uso."""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave determinista basada en argumentos
            args_key = ":".join(str(a) for a in args)
            kwargs_key = ":".join(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = f"{prefix}:{args_key}:{kwargs_key}".strip(":")

            cached_data = cache_manager.get(cache_key)
            if cached_data is not None:
                return cached_data

            result = func(*args, **kwargs)
            if result is not None:
                cache_manager.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator
