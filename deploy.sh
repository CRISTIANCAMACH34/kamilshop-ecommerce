#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue Automatizado en Hostinger VPS - E-COMERCE TIO Y CAMILA
# ==============================================================================
set -e

echo "=========================================================="
echo "🚀 Iniciando despliegue de E-COMERCE TIO Y CAMILA en Hostinger"
echo "=========================================================="

# 1. Comprobar que existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️ Archivo .env no encontrado. Creando a partir de .env.example..."
    cp .env.example .env
    echo "❗ Por favor revisa y completa los tokens en .env antes de continuar."
    exit 1
fi

# 2. Descargar últimas imágenes y construir contenedores
echo "📦 Construyendo imágenes de Docker..."
docker compose build --pull

# 3. Levantar servicios en segundo plano
echo "🔄 Levantando contenedores (PostgreSQL, Redis, Backend, Celery, Frontend)..."
docker compose up -d

# 4. Esperar a que el backend esté listo
echo "⏳ Verificando salud del sistema..."
sleep 8

# 5. Comprobar estado de los contenedores
docker compose ps

echo "=========================================================="
echo "✅ Despliegue completado con éxito."
echo "🌐 Frontend y API disponibles en el puerto 80."
echo "📊 Para ver logs en vivo: docker compose logs -f"
echo "=========================================================="
