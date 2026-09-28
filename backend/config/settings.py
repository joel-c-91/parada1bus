from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Configuración por entorno ───────────────────────────────────────────────
# Estas variables se leen del entorno (ver .env.example). Los valores por
# defecto son SOLO para desarrollo local: en producción DJANGO_SECRET_KEY es
# obligatoria y la base de datos tiene que ser PostgreSQL.
#
# NOTA DE SEGURIDAD: la clave que estaba hardcodeada antes de este cambio
# (&'django-insecure-...') quedó expuesta en el historial de git. Hay que
# generar una nueva para cualquier despliegue real:
#   python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or 'django-insecure-dev-only-cambiar-en-produccion'

DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Terceros
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    # Apps propias
    'flota',
    'servicios',
    'charter',
    'rutas',
    'reservas',
    'contacto',
    'usuarios',
    'finanzas',
    'promociones',
    'configuracion',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ── Base de datos ───────────────────────────────────────────────────────────
# Sin variables DB_* definidas usa SQLite (así el backend sigue levanta con un
# `python manage.py runserver` sin Docker). Con DB_ENGINE=postgresql usa
# PostgreSQL, que es lo que usa Docker Compose y lo que debe usarse en
# producción.
#
# Antes esta config estaba comentada con la contraseña escrita adentro del
# archivo, lo que la dejaba expuesta en el repositorio. Ahora sale del entorno.
if os.environ.get('DB_ENGINE') == 'postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'parada1bus'),
            'USER': os.environ.get('DB_USER', 'parada1bus'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'es-ar'
TIME_ZONE = 'America/Argentina/Cordoba'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DATETIME_FORMAT': '%d/%m/%Y %H:%M',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # Denegar por defecto: cada endpoint declara su superficie publica.
    # Nunca usar AllowAny como default global.
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
