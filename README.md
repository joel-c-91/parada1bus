# Parada 1 Bus — Plataforma Web

Sistema de gestión de viajes especiales y reservas para **Parada 1 Bus**, empresa de transporte con sede en Río Cuarto, Córdoba, Argentina.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 |
| Backend | Django 5.2 + Django REST Framework 3.16 + SimpleJWT |
| Base de datos | SQLite (desarrollo rápido) / PostgreSQL 16 (Docker y producción) |
| Autenticación | JWT con refresh automático |
| Mapas | Leaflet + OpenStreetMap |
| Íconos | Lucide React |

## Inicio rápido con Docker (recomendado)

Un solo comando levanta PostgreSQL + Django + Vite. Es la vía recomendada
porque evita tener que mantener dos venvs distintas.

> En esta máquina el plugin `docker compose` v2 **no está instalado**. Usar el
> binario con guion: `docker-compose up -d`.

```bash
cp .env.example .env      # solo la primera vez
docker-compose up -d
```

| Servicio | URL |
|----------|-----|
| Sitio público | http://localhost:5173 |
| Panel de administración | http://localhost:5173/admin/login |
| API Django | http://localhost:8000/api/ |
| Admin de Django | http://localhost:8000/admin/ |

La primera vez tarda un poco más: construye las imágenes y aplica las
migraciones automáticamente. Para ver qué está pasando:

```bash
docker-compose logs -f backend
```

### Comandos habituales

```bash
docker-compose up -d          # levantar
docker-compose stop           # parar (CONSERVA la base de datos)
docker-compose down           # parar y eliminar containers (conserva el volumen)
docker-compose down -v        # DESTRUCTIVO: también borra la base de datos
docker-compose logs -f        # ver logs de todos los servicios
docker-compose exec backend python manage.py createsuperuser
```

## Desarrollo sin Docker

Útil para iterar rápido en el backend con SQLite, sin levantar containers.

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # creá tu usuario admin
python manage.py runserver
```

Corre en `http://localhost:8000`. Sin variables `DB_*` definidas usa SQLite.

> Ojo: existen dos venvs (`backend/.venv` y `backend/venv`). La válida es
> **`.venv`**. `venv/` es una copia vieja.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173` y hace proxy de `/api` hacia
`http://localhost:8000`.

### Verificaciones de calidad

```bash
cd frontend
npx tsc --noEmit     # typecheck estricto
npm run build        # compila para producción
cd ../backend
python manage.py check
python manage.py makemigrations --check --dry-run
```

## Estructura del proyecto

```
parada1bus/
├── backend/                    # Django REST API
│   ├── config/                 # settings.py, urls.py, api.py
│   ├── flota/                  # Vehículos
│   ├── servicios/              # Tipos de servicio
│   ├── charter/                # Solicitudes de viaje a medida
│   ├── rutas/                  # Rutas fijas, horarios y salidas
│   ├── reservas/               # Reservas de pasajes
│   ├── usuarios/               # Clientes
│   ├── finanzas/               # Pagos, gastos, categorías y cheques
│   ├── promociones/           # Promociones
│   ├── configuracion/          # Parámetros del sitio
│   ├── contacto/               # Mensajes de contacto
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Layout y componentes del panel
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   └── ui/             # Componentes reutilizables
│   │   ├── pages/
│   │   │   └── admin/          # Páginas CRUD del panel
│   │   ├── contexts/           # AuthContext
│   │   ├── lib/                # Cliente de API, React Query
│   │   └── types/              # Tipos TypeScript
│   ├── Dockerfile
│   └── vite.config.ts
├── openspec/                   # Artefactos de Spec-Driven Development
├── docker-compose.yml          # PostgreSQL + Django + Vite
└── .env.example
```

## API REST

Pública, en `http://localhost:8000/api/`:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/vehiculos/` | Lista de la flota |
| GET | `/api/servicios/` | Servicios disponibles |
| GET | `/api/solicitudes-charter/` | Solicitudes de viaje a medida |
| GET | `/api/rutas/` | Rutas fijas con horarios y precios |
| GET | `/api/rutas/buscar/?origen=X&destino=Y` | Buscar rutas entre dos ciudades |
| GET | `/api/rutas/{id}/` | Detalle de ruta con salidas |
| GET/POST | `/api/reservas/` | Reservas de pasajes |
| POST | `/api/contacto/` | Enviar mensaje de contacto |

Panel de administración (requiere token JWT), en `/api/admin/`:

| Endpoint | Descripción |
|----------|-------------|
| `vehiculos`, `servicios`, `rutas`, `salidas` | CRUD con paginación (25 por página) |
| `clientes` | CRUD de clientes |
| `pagos`, `gastos`, `categorias-gasto` | Control financiero |
| `cheques` | Cheques con estados: en cartera, depositado, rechazado, entregado |

Autenticación: `POST /api/auth/token/` con `{ "username": ..., "password": ... }`
y `POST /api/auth/token/refresh/` para renovar. Ojo: **username**, no email.

## Configuración

Todo se lee de variables de entorno. Ver `.env.example` para la lista completa
con comentarios.

| Variable | Para qué |
|----------|----------|
| `DJANGO_SECRET_KEY` | **Obligatoria en producción.** Generar una por proyecto |
| `DJANGO_DEBUG` | `False` en producción |
| `DJANGO_ALLOWED_HOSTS` | Dominios permitidos, separados por comas |
| `DB_ENGINE` | `postgresql` para usar Postgres; si no está, usa SQLite |
| `DB_HOST` | Dentro de Docker Compose debe ser `db`, **no** `localhost` |
| `VITE_PROXY_TARGET` | Solo con Docker: `http://backend:8000` |

### Seguridad — importante antes de producción

- **No** subas el archivo `.env` al repositorio (ya está en `.gitignore`).
- Generá una `DJANGO_SECRET_KEY` nueva. La que estaba hardcodeada en
  `settings.py` quedó expuesta en el historial de git y no debe reutilizarse.
- `DJANGO_DEBUG` en `False` y `ALLOWED_HOSTS` acotado a los dominios reales.
- Cambiá la contraseña de PostgreSQL: el valor por defecto de `docker-compose.yml`
  es solo para desarrollo.

## Datos de contacto para actualizar antes de publicar

- **WhatsApp** — reemplazar `5493584000000` en:
  - `frontend/src/components/layout/Navbar.tsx`
  - `frontend/src/components/layout/Footer.tsx`
  - `frontend/src/pages/Contacto.tsx`
- **Email** — reemplazar `info@parada1bus.com` en:
  - `frontend/src/components/layout/Footer.tsx`
  - `frontend/src/pages/Contacto.tsx`

## Deuda técnica conocida

Cosas que funcionan pero conviene arreglar:

- `AdminPagination` está **duplicado** en `flota/views.py`, `rutas/views.py` y
  `servicios/views.py`. Debería vivir en un módulo compartido.
- El bundle de frontend pesa ~600 kB sin code-splitting. Vite advierte chunks
  mayores a 500 kB. Con `React.lazy` se puede partir por ruta.
- No hay tests automatizados. Antes de tocar la lógica de negocio conviene
  agregar al menos tests de los modelos de `finanzas` y de los serializers.

---

Desarrollado para Parada 1 Bus.
