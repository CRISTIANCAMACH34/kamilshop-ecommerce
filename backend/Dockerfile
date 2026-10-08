# ==============================================================================
# Dockerfile para Backend FastAPI (E-COMERCE TIO Y CAMILA)
# Optimizado para producción en Hostinger VPS con usuario no-root y Gunicorn/Uvicorn
# ==============================================================================

FROM python:3.11-slim AS builder

WORKDIR /build

# Instalar herramientas de compilación para psycopg2 y extensiones C
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt


# Etapa Final de Producción (Ligera y Segura)
FROM python:3.11-slim

WORKDIR /app

# Instalar únicamente librerías compartidas de PostgreSQL y curl para el healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias pre-compiladas desde la etapa builder
COPY --from=builder /install /usr/local

# Crear usuario sin privilegios root
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/bash -m appuser

# Copiar código fuente
COPY . /app/
RUN chown -R appuser:appgroup /app

# Variables de entorno de ejecución
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

USER appuser

EXPOSE 8000

# Healthcheck para Docker y orquestadores
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Servidor de producción: Gunicorn administrando workers Uvicorn asíncronos
CMD ["gunicorn", "app.main:app", "-w", "3", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-"]
