# Imagen de DESARROLLO para el backend de Parada 1 Bus.
# Para produccion hay que cambiar el CMD a gunicorn (ver proyecto cuentasclaras).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias de sistema: libpq-dev para compilar psycopg, build-essential para
# cualquier paquete sin wheel precompilado.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt en su propia capa: mientras no cambie, pip no se re-ejecuta
# y el build es instantaneo.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Sin --noreload: Django no tiene esa opcion. El autoreload reinicia el proceso
# cuando detecta cambios, por eso el codigo va bind-mounted desde el host.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
