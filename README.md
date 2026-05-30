# Parada 1 Bus — Plataforma Web

Sistema de gestión de viajes especiales y reservas para **Parada 1 Bus**, empresa de transporte con sede en Río Cuarto, Córdoba, Argentina.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Django 5 + Django REST Framework |
| Base de datos | SQLite (desarrollo) / PostgreSQL (producción) |
| Mapas | Leaflet + OpenStreetMap |
| Íconos | Lucide React |

## Estructura del proyecto

```
parada1bus/
├── backend/                    # Django REST API
│   ├── config/                 # Configuración del proyecto
│   │   ├── settings.py         # Settings (dev/prod)
│   │   ├── urls.py             # Rutas principales
│   │   └── api.py              # Router de la API
│   ├── flota/                  # Gestión de vehículos
│   ├── servicios/              # Tipos de servicio
│   ├── charter/                # Solicitudes de viaje a medida
│   ├── rutas/                  # Rutas fijas y horarios
│   ├── reservas/               # Reservas de pasajes
│   └── contacto/               # Mensajes de contacto
├── frontend/                   # React SPA
│   └── src/
│       ├── components/         # Componentes reutilizables
│       │   ├── layout/         # Navbar, Footer, Layout
│       │   └── ui/             # Componentes de UI
│       ├── pages/              # Páginas de la aplicación
│       ├── lib/                # Utilidades (API client, etc.)
│       └── types/              # Tipos TypeScript
├── docker-compose.yml          # PostgreSQL para producción
└── .gitignore
```

## Requisitos

- Python 3.12+
- Node.js 22+
- npm 10+
- Docker (opcional, solo para PostgreSQL en producción)

## Instalación y ejecución local

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

El servidor corre en `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

El servidor corre en `http://localhost:5173`.

### 3. Panel de administración

Acceder a `http://localhost:8000/admin`

**Usuario por defecto:** `admin` — **Contraseña:** `admin123`

> **Importante:** Cambiar estas credenciales en producción.

## API REST

La API está disponible en `http://localhost:8000/api/`:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/vehiculos/` | Lista de la flota |
| GET | `/api/servicios/` | Servicios disponibles |
| GET/POST | `/api/solicitudes-charter/` | Solicitudes de viaje a medida |
| GET | `/api/rutas/` | Rutas fijas (con horarios) |
| GET/POST | `/api/reservas/` | Reservas de pasajes |
| POST | `/api/contacto/` | Enviar mensaje de contacto |

## Variables de configuración importantes

### WhatsApp
Reemplazar `5493584000000` por el número real de la empresa en:
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/pages/Contacto.tsx`

### Email
Reemplazar `info@parada1bus.com` por el email real en:
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/pages/Contacto.tsx`

## Despliegue a producción

### Base de datos PostgreSQL

Para usar PostgreSQL en lugar de SQLite:

1. Descomentar la configuración de PostgreSQL en `backend/config/settings.py`
2. Levantar PostgreSQL con Docker:

```bash
docker-compose up -d
```

### Frontend (Vercel — plan free)

```bash
cd frontend
npm run build
```

Conectar el repositorio a [Vercel](https://vercel.com) y configurar:
- Framework: Vite
- Directorio: `frontend/`

### Backend (Railway o Render — plan free)

Conectar el repositorio y configurar:
- Comando: `cd backend && gunicorn config.wsgi`
- Puerto: `8000`

---

Desarrollado con ❤️ para Parada 1 Bus.
