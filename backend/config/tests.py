"""Matriz de permisos del API.

Objetivo: la superficie publica del sitio se mantiene funcionando, pero
cualquier lectura o escritura de datos operativos exige autenticacion.

Regla de diseno: ``DEFAULT_PERMISSION_CLASSES`` es ``IsAuthenticated``.
Cada viewset declara su propia superficie publica con ``public_methods``.
"""

from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from charter.models import SolicitudCharter
from contacto.models import MensajeContacto
from reservas.models import Reserva
from rutas.models import Ruta, Salida


class PermisosBaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.ruta = Ruta.objects.create(
            nombre='Córdoba - Buenos Aires',
            origen='Córdoba',
            destino='Buenos Aires',
        )
        self.salida = Salida.objects.create(
            ruta=self.ruta,
            dia_semana='lun',
            hora_salida='08:00',
            precio_base='25000.00',
        )

    def payload_reserva(self):
        return {
            'salida': self.salida.id,
            'fecha_viaje': str(date.today() + timedelta(days=30)),
            'nombre': 'Ana Publica',
            'email': 'ana@example.com',
            'telefono': '+5493512345678',
            'cantidad_asientos': 2,
        }

    def payload_contacto(self):
        return {
            'nombre': 'Bruno Publico',
            'email': 'bruno@example.com',
            'telefono': '+5493512345678',
            'motivo': 'consulta',
            'mensaje': 'Consulta desde el sitio.',
        }

    def payload_charter(self):
        return {
            'nombre': 'Carla Publica',
            'email': 'carla@example.com',
            'telefono': '+5493512345678',
            'origen': 'Córdoba',
            'destino': 'Rosario',
            'fecha_viaje': str(date.today() + timedelta(days=30)),
            'cantidad_pasajeros': 4,
        }


class DefaultEsDenegar(TestCase):
    """El default global no puede volver a ser permisivo por accidente."""

    def setUp(self):
        self.client = APIClient()

    def test_default_permission_classes_es_is_authenticated(self):
        from django.conf import settings

        self.assertEqual(
            list(settings.REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES']),
            ['rest_framework.permissions.IsAuthenticated'],
        )

    def test_endpoint_admin_anonimo_esta_protegido(self):
        response = self.client.get('/api/admin/pagos/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_endpoint_admin_autenticado_accede(self):
        User.objects.create_user('admin_test', password='x')
        self.client.force_authenticate(User.objects.get(username='admin_test'))
        response = self.client.get('/api/admin/pagos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AccionesInternasNoSonPublicas(PermisosBaseTestCase):
    """Una accion interna POST no puede quedar abierta por ser POST."""

    def setUp(self):
        super().setUp()
        self.solicitud = SolicitudCharter.objects.create(**self.payload_charter())

    def test_cotizar_anonimo_prohibido(self):
        """Regresion: filtrar por metodo HTTP en vez de por accion."""
        response = self.client.post(
            f'/api/solicitudes-charter/{self.solicitud.id}/cotizar/',
            {'precio': '999999.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.solicitud.refresh_from_db()
        self.assertEqual(self.solicitud.estado, 'pendiente')
        self.assertIsNone(self.solicitud.precio_cotizado)

    def test_cotizar_sin_precio_anonimo_sigue_prohibido(self):
        """El 400 de validacion no debe filtrar informacion antes del 401."""
        response = self.client.post(
            f'/api/solicitudes-charter/{self.solicitud.id}/cotizar/',
            {},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_accion_inexistente_devuelve_404(self):
        """Una ruta no registrada es 404, con o sin sesion, y no filtra datos.

        Django resuelve la URL antes de evaluar permisos, asi que un endpoint
        inexistente nunca revela si el recurso existe o que permisos tiene.
        """
        response = self.client.post('/api/reservas/999999/cobrar/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CatalogosPublicos(PermisosBaseTestCase):
    """Los catalogos del sitio publico se leen sin autenticacion."""

    def test_vehiculos_publico(self):
        self.assertEqual(self.client.get('/api/vehiculos/').status_code, 200)

    def test_servicios_publico(self):
        self.assertEqual(self.client.get('/api/servicios/').status_code, 200)

    def test_rutas_publico(self):
        self.assertEqual(self.client.get('/api/rutas/').status_code, 200)

    def test_busqueda_de_rutas_publica(self):
        response = self.client.get('/api/rutas/buscar/', {'origen': 'Córdoba', 'destino': 'Buenos Aires'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('resultados', response.data)

    def test_escritura_en_catalogo_anonima_prohibida(self):
        response = self.client.post('/api/vehiculos/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FormulariosPublicos(PermisosBaseTestCase):
    """Los formularios del sitio siguen funcionando sin sesion."""

    def test_crear_reserva_publico(self):
        response = self.client.post('/api/reservas/', self.payload_reserva(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['codigo'].startswith('P1B-'))
        self.assertEqual(Reserva.objects.count(), 1)

    def test_crear_mensaje_contacto_publico(self):
        response = self.client.post('/api/contacto/', self.payload_contacto(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MensajeContacto.objects.count(), 1)

    def test_crear_solicitud_charter_publico(self):
        response = self.client.post('/api/solicitudes-charter/', self.payload_charter(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SolicitudCharter.objects.count(), 1)


class DatosOperativosProtegidos(PermisosBaseTestCase):
    """Datos personales y acciones internas exigen autenticacion."""

    def _crear_registros(self):
        self.reserva = Reserva.objects.create(
            salida=self.salida,
            fecha_viaje=date.today() + timedelta(days=30),
            nombre='Ana Privada',
            email='ana@example.com',
            telefono='+5493512345678',
            cantidad_asientos=2,
            codigo='P1B-ABC123',
        )
        self.solicitud = SolicitudCharter.objects.create(
            **{
                k: v for k, v in self.payload_charter().items()
            }
        )
        self.mensaje = MensajeContacto.objects.create(**self.payload_contacto())

    def setUp(self):
        super().setUp()
        self._crear_registros()

    # --- reservas: datos personales ---
    def test_listar_reservas_anonimo_prohibido(self):
        self.assertEqual(self.client.get('/api/reservas/').status_code, 401)

    def test_ver_reserva_anonimo_prohibido(self):
        self.assertEqual(self.client.get(f'/api/reservas/{self.reserva.id}/').status_code, 401)

    def test_modificar_reserva_anonimo_prohibido(self):
        response = self.client.patch(
            f'/api/reservas/{self.reserva.id}/', {'estado': 'cancelada'}, format='json'
        )
        self.assertEqual(response.status_code, 401)
        self.reserva.refresh_from_db()
        self.assertEqual(self.reserva.estado, 'pendiente')

    def test_eliminar_reserva_anonimo_prohibido(self):
        self.assertEqual(self.client.delete(f'/api/reservas/{self.reserva.id}/').status_code, 401)
        self.assertEqual(Reserva.objects.count(), 1)

    # --- solicitudes charter ---
    def test_listar_solicitudes_anonimo_prohibido(self):
        self.assertEqual(self.client.get('/api/solicitudes-charter/').status_code, 401)

    def test_cotizar_anonimo_prohibido(self):
        """Escritura publica sin sesion: el agujero mas grave."""
        response = self.client.post(
            f'/api/solicitudes-charter/{self.solicitud.id}/cotizar/',
            {'precio': '999999.00'},
            format='json',
        )
        self.assertEqual(response.status_code, 401)
        self.solicitud.refresh_from_db()
        self.assertEqual(self.solicitud.estado, 'pendiente')
        self.assertIsNone(self.solicitud.precio_cotizado)

    def test_eliminar_solicitud_anonimo_prohibido(self):
        self.assertEqual(
            self.client.delete(f'/api/solicitudes-charter/{self.solicitud.id}/').status_code, 401
        )
        self.assertEqual(SolicitudCharter.objects.count(), 1)

    # --- mensajes de contacto ---
    def test_listar_mensajes_anonimo_prohibido(self):
        """Los mensajes de contacto no son publicos: tienen datos personales."""
        self.assertEqual(self.client.get('/api/contacto/').status_code, 401)

    # --- con autenticacion ---
    def setUp_auth(self):
        self.user = User.objects.create_user('operador', password='x')
        self.client.force_authenticate(self.user)

    def test_operador_puede_listar_reservas(self):
        self.setUp_auth()
        self.assertEqual(self.client.get('/api/reservas/').status_code, 200)

    def test_operador_puede_listar_solicitudes(self):
        self.setUp_auth()
        self.assertEqual(self.client.get('/api/solicitudes-charter/').status_code, 200)

    def test_operador_puede_listar_mensajes(self):
        self.setUp_auth()
        self.assertEqual(self.client.get('/api/contacto/').status_code, 200)

    def test_operador_puede_cotizar(self):
        self.setUp_auth()
        response = self.client.post(
            f'/api/solicitudes-charter/{self.solicitud.id}/cotizar/',
            {'precio': '150000.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.solicitud.refresh_from_db()
        self.assertEqual(self.solicitud.estado, 'cotizado')
        self.assertEqual(str(self.solicitud.precio_cotizado), '150000.00')
