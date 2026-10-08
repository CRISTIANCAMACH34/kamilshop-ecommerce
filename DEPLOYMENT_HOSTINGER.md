# 🚀 Guía Oficial de Despliegue en Hostinger VPS
## E-COMERCE TIO Y CAMILA

Esta guía describe el paso a paso para desplegar la arquitectura completa de contenedores en un servidor virtual privado (**VPS**) de **Hostinger**.

---

## 🏗️ Arquitectura Desplegada

| Servicio | Contenedor | Puerto Interno | Puerto Expuesto | Función |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Nginx** | `camilaytio_frontend` | `80` | `80` (HTTP) / `443` | Sirve la SPA React compilada y enruta `/api/` |
| **Backend FastAPI** | `camilaytio_backend` | `8000` | `127.0.0.1:8000` | Lógica hexagonal, endpoints REST y autenticación |
| **PostgreSQL 16** | `camilaytio_postgres` | `5432` | `127.0.0.1:5432` | Base de datos relacional con esquema 5NF ACID |
| **Redis 7** | `camilaytio_redis` | `6379` | `127.0.0.1:6379` | Caché en memoria y broker de mensajería Celery |
| **Celery Worker** | `camilaytio_celery_worker`| - | - | Tareas pesadas en segundo plano (emails, webhooks) |
| **Celery Beat** | `camilaytio_celery_beat` | - | - | Tareas programadas periódicas (limpieza de carritos, cierres) |

---

## 📋 Paso 1: Preparar el VPS en Hostinger

1. Ingresa a tu panel de control de **Hostinger** en [hpanel.hostinger.com](https://hpanel.hostinger.com).
2. Ve a la sección **VPS** y asegúrate de tener instalado el sistema operativo **Ubuntu 22.04 LTS** o **Ubuntu 24.04 LTS**.
3. Abre tu terminal y conéctate por SSH a tu servidor:
   ```bash
   ssh root@TU_IP_DEL_VPS
   ```

---

## 🐳 Paso 2: Instalar Docker y Docker Compose en Ubuntu

Ejecuta el script oficial de Docker en tu servidor:

```bash
# Actualizar repositorios
apt-get update && apt-get upgrade -y

# Instalar dependencias previas
apt-get install -y ca-certificates curl gnupg git ufw

# Instalar Docker Engine oficial
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verificar instalación
docker --version
docker compose version
```

---

## 📂 Paso 3: Clonar el Proyecto en el Servidor

```bash
# Crear directorio de trabajo
cd /var/www
git clone https://github.com/TU_USUARIO/E-comerce_camilaytio.git
cd E-comerce_camilaytio
```

---

## 🔑 Paso 4: Configurar el Archivo `.env` con tus Credenciales

Crea el archivo `.env` a partir de la plantilla:

```bash
cp .env.example .env
nano .env
```

Edita los valores necesarios. Aquí tienes la guía de dónde obtener cada token cuando los tengas a mano:

### 1. Wompi Colombia ([comercios.wompi.co](https://comercios.wompi.co/))
* **`WOMPI_PUBLIC_KEY`**: En el panel Wompi > *Desarrolladores* > *Llave pública*.
* **`WOMPI_PRIVATE_KEY`**: *Llave privada* (comienza por `prv_prod_` o `prv_test_`).
* **`WOMPI_INTEGRITY_SECRET`**: *Secreto de integridad* (usado para firmar transacciones con sha256).
* **`WOMPI_EVENT_SECRET`**: *Event secret* para verificar la firma de los webhooks entrantes.

### 2. Google OAuth ([console.cloud.google.com](https://console.cloud.google.com/))
* Crea un proyecto > *APIs & Services* > *Credentials* > *OAuth 2.0 Client ID*.
* Tipo de aplicación: *Web application*.
* URIs de redirección autorizados: `https://tudominio.com/api/v1/auth/google/callback`.
* Copia el **`GOOGLE_CLIENT_ID`** y **`GOOGLE_CLIENT_SECRET`**.

### 3. Apple ID Sign-In ([developer.apple.com](https://developer.apple.com/))
* *Certificates, Identifiers & Profiles* > *Identifiers* > *Services IDs*.
* Obtén tu **`APPLE_TEAM_ID`**, **`APPLE_CLIENT_ID`** y genera una Key privada `.p8` (**`APPLE_KEY_ID`** y **`APPLE_PRIVATE_KEY`**).

### 4. Facebook Login ([developers.facebook.com](https://developers.facebook.com/))
* Crea una app de tipo *Consumidor* > añade el producto *Inicio de sesión con Facebook*.
* Copia tu **`FACEBOOK_APP_ID`** y **`FACEBOOK_APP_SECRET`**.

### 5. Correo Empresarial Hostinger (Titan Mail)
* En hPanel > *Emails* > *Configuración de servidor*.
* `SMTP_HOST=smtp.hostinger.com`
* `SMTP_PORT=465`
* `SMTP_USER=notificaciones@tudominio.com`
* `SMTP_PASSWORD=tu_clave`

Guarda el archivo en `nano` presionando `Ctrl + O`, `Enter` y sal con `Ctrl + X`.

---

## 🚀 Paso 5: Desplegar con Docker Compose

Da permisos de ejecución al script y lanza el despliegue:

```bash
chmod +x deploy.sh
./deploy.sh
```

O si prefieres ejecutar directamente:
```bash
docker compose up -d --build
```

Docker descargará las imágenes base, compilará la aplicación de React con Vite, construirá el contenedor de Python FastAPI con Gunicorn, e iniciará PostgreSQL, Redis y Celery.

---

## 🌐 Paso 6: Configurar Dominio y DNS en Hostinger

1. En tu panel de Hostinger, ve a **Dominios** > **Zona DNS**.
2. Añade o edita los siguientes registros:
   * **Tipo A:** Host `@` apuntando a la **IP de tu VPS Hostinger**.
   * **Tipo A:** Host `www` apuntando a la **IP de tu VPS Hostinger**.
3. La propagación DNS toma entre 5 minutos y unas pocas horas.

---

## 🔒 Paso 7: Activar Certificado SSL Gratuito (HTTPS) con Certbot

Una vez que tu dominio apunte a la IP del VPS, instala Certbot en el servidor para obtener SSL automático de Let's Encrypt:

```bash
# Instalar Certbot
apt-get install -y certbot

# Detener temporalmente el frontend para emitir el certificado
docker compose stop frontend

# Obtener certificado SSL
certbot certonly --standalone -d tudominio.com -d www.tudominio.com --agree-tos -m admin@tudominio.com --non-interactive

# Volver a iniciar los servicios
docker compose start frontend
```

---

## 🛠️ Comandos de Mantenimiento Útiles

### Ver el estado de todos los contenedores:
```bash
docker compose ps
```

### Ver logs en tiempo real (todos los servicios):
```bash
docker compose logs -f
```

### Ver logs únicamente del backend:
```bash
docker compose logs -f backend
```

### Ver logs de las tareas asíncronas de Celery:
```bash
docker compose logs -f celery_worker
```

### Reiniciar el sistema tras actualizar código:
```bash
git pull
./deploy.sh
```

### Probar la caché de Redis directamente desde el servidor:
```bash
docker compose exec redis redis-cli -a TU_CLAVE_REDIS ping
# Respuesta esperada: PONG
```

### Realizar una copia de seguridad (backup) de la base de datos:
```bash
docker compose exec -T postgres pg_dump -U camilaytio_admin camilaytio_ecommerce > backup_$(date +%Y%m%d).sql
```
