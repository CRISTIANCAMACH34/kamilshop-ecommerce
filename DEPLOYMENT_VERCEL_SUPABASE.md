# 🚀 Guía de Despliegue a Producción: Supabase & Vercel
## KAMIL SHOP E-Commerce Platform

Esta guía detalla paso a paso el proceso para desplegar **KAMIL SHOP** a producción utilizando **Supabase** como base de datos PostgreSQL de alto rendimiento y **Vercel** para el alojamiento del Frontend React/Vite y la API Serverless FastAPI.

---

## 🗄️ Paso 1: Configuración de Base de Datos en Supabase (PostgreSQL)

1. **Crear Proyecto en Supabase:**
   - Inicia sesión o regístrate en [Supabase.com](https://supabase.com/).
   - Haz clic en **New Project**, asigna un nombre (ej. `kamilshop-prod`) y establece una contraseña segura para la base de datos.
   - Selecciona la región geográfica más cercana a tu público objetivo (ej. *South America - São Paulo* o *US East*).

2. **Obtener la Cadena de Conexión (DATABASE_URL):**
   - Ve a **Project Settings** (icono de engranaje) > **Database**.
   - En la sección **Connection String**, selecciona la pestaña **URI**.
   - Puedes usar el **Transaction Pooler** (Puerto `6543`, recomendado para entornos serverless en Vercel) o **Direct Connection** (Puerto `5432`).
   - Copia la URL que luce similar a:
     ```text
     postgresql://postgres.[PROJECT-REF]:[NUESTRA_CLAVE]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - *Nota:* Si la URL inicia con `postgres://`, el sistema la normalizará automáticamente a `postgresql://` para compatibilidad total con SQLAlchemy.

3. **Inicialización Automática del Esquema:**
   - La aplicación ejecuta automáticamente `init_db()` al iniciar, creando de forma atómica e idempotente todas las tablas relacionales (`orders`, `order_items`, `customers`, `returns`, `brands`, `products`, `product_variants`) e índices compuestos B-Tree en Supabase.

---

## 📐 Paso 2: Despliegue en Vercel

### Opción A: Despliegue Fullstack Monorepo (Recomendada)
Vercel alojará la aplicación completa: el Frontend React/Vite estático compilado en `frontend/dist` y la API FastAPI como Serverless Functions a través de `api/index.py`.

1. **Importar Repositorio en Vercel:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard) y haz clic en **Add New > Project**.
   - Importa el repositorio de GitHub/GitLab de KAMIL SHOP.

2. **Configuración del Proyecto:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (Raíz del proyecto)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`

3. **Variables de Entorno (Environment Variables):**
   Agrega las siguientes variables en Vercel en **Settings > Environment Variables**:

   | Variable | Valor de Ejemplo / Descripción |
   | :--- | :--- |
   | `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` |
   | `SECRET_KEY` | `clave_secreta_super_segura_produccion_2026_kamilshop` |
   | `APP_ENV` | `production` |
   | `DEBUG` | `false` |
   | `CORS_ORIGINS` | `https://tu-proyecto.vercel.app,https://www.kamilshop.store` |
   | `VITE_API_URL` | `/api/v1` |

4. **Desplegar:**
   - Haz clic en **Deploy**. Vercel compilará la aplicación y desplegará tanto el Frontend como las rutas `/api/v1/*` de la API Python.

---

### Opción B: Despliegue del Frontend Únicamente en Vercel
Si prefieres alojar el backend Python en Render, Railway, Fly.io o VPS:

1. Configura en Vercel:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
2. Variables de Entorno en Vercel:
   - `VITE_API_URL` = `https://tu-backend-api.onrender.com/api/v1`

---

## 🔍 Paso 3: Verificación de Producción

Una vez completado el despliegue, puedes verificar el estado y los endpoints principales:

- **Health Check API:** `https://tu-proyecto.vercel.app/health`
- **Documentación Swagger OpenAPI:** `https://tu-proyecto.vercel.app/docs`
- **Portal de la Tienda:** `https://tu-proyecto.vercel.app/`
- **Portal Administrativo:** `https://tu-proyecto.vercel.app/#pasarela` (Acceso con `admin@titulo.store` / `admin2026`).

---

## 🛡️ Archivos de Configuración Incluidos en el Repositorio

- [`vercel.json`](file:///c:/Users/crist/Documents/Software%20de%20venta/E-comerce_camilaytio/vercel.json): Reglas de ruteo para Vite + FastAPI Serverless.
- [`frontend/vercel.json`](file:///c:/Users/crist/Documents/Software%20de%20venta/E-comerce_camilaytio/frontend/vercel.json): Soporte SPA para rutas de React Router.
- [`api/index.py`](file:///c:/Users/crist/Documents/Software%20de%20venta/E-comerce_camilaytio/api/index.py): Punto de entrada Serverless Function para Vercel Python Runtime.
- [`requirements.txt`](file:///c:/Users/crist/Documents/Software%20de%20venta/E-comerce_camilaytio/requirements.txt): Lista de dependencias Python para la compilación en Vercel.
- [`backend/app/infrastructure/database.py`](file:///c:/Users/crist/Documents/Software%20de%20venta/E-comerce_camilaytio/backend/app/infrastructure/database.py): Manejo adaptativo para PostgreSQL/Supabase y SQLite.
