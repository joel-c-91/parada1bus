"""Invariantes de reserva: no sobrevender y no duplicar codigos."""

from datetime import date, timedelta
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.test import TestCase

from flota.models import Vehiculo
from reservas import services
from reservas.models import Reserva
from rutas.models import Ruta, Salida


class BaseReservaTest(TestCase):
    def setUp(self):
        self.van = Vehiculo.objects.create(
            nombre='Van 1', tipo='van', capacidad=8, patente='AA111AA'
        )
        self.ruta = Ruta.objects.create(
            nombre='Córdoba - Río Cuarto', origen='Córdoba', destino='Río Cuarto'
        )
        self.salida = Salida.objects.create(
            ruta=self.ruta,
            dia_semana='lun',
            hora_salida='08:00',
            vehiculo=self.vehiculo(),
            precio_base=Decimal('15000.00'),
        )

    def vehiculo(self):
        return self.van

    def datos(self, cantidad=2, **extra):
        base = {
            'salida': self.salida,
            'fecha_viaje': date.today() + timedelta(days=30),
            'nombre': 'Ana',
            'email': 'ana@example.com',
            'telefono': '+5493512345678',
            'cantidad_asientos': cantidad,
        }
        base.update(extra)
        return base


class CapacidadHeredadaTest(BaseReservaTest):
    def test_hereda_capacidad_del_vehiculo(self):
        self.assertEqual(self.salida.capacidad, 8)

    def test_capacidad_explicita_manda(self):
        salida = Salida.objects.create(
            ruta=self.ruta, dia_semana='mar', hora_salida='09:00',
            vehiculo=self.vehiculo(), precio_base=Decimal('15000.00'),
            capacidad=3,
        )
        self.assertEqual(salida.capacidad, 3)

    def test_sin_vehiculo_no_inventa_capacidad(self):
        salida = Salida.objects.create(
            ruta=self.ruta, dia_semana='mie', hora_salida='09:00',
            precio_base=Decimal('15000.00'),
        )
        self.assertIsNone(salida.capacidad)
        self.assertIsNone(salida.asientos_disponibles)

    def test_cambiar_capacidad_del_vehiculo_no_reescribe_la_salida(self):
        """La capacidad queda congelada al crearse la salida."""
        self.van.capacidad = 20
        self.van.save()
        self.salida.refresh_from_db()
        self.assertEqual(self.salida.capacidad, 8)


class NoSobreventaTest(BaseReservaTest):
    def test_disponibles_bajan_con_cada_reserva(self):
        self.assertEqual(self.salida.asientos_disponibles, 8)
        services.crear_reserva(**self.datos(3))
        self.assertEqual(self.salida.asientos_disponibles, 5)
        services.crear_reserva(**self.datos(2, email='b@example.com'))
        self.assertEqual(self.salida.asientos_disponibles, 3)

    def test_no_puede_sobrepasar_la_capacidad(self):
        services.crear_reserva(**self.datos(6))
        with self.assertRaises(services.SinCapacidad):
            services.crear_reserva(**self.datos(3, email='b@example.com'))

    def test_último_asiento_exacto(self):
        services.crear_reserva(**self.datos(5))
        reserva = services.crear_reserva(**self.datos(3, email='b@example.com'))
        self.assertEqual(reserva.cantidad_asientos, 3)
        self.assertEqual(self.salida.asientos_disponibles, 0)

    def test_cancelar_libera_el_asiento(self):
        reserva = services.crear_reserva(**self.datos(4))
        self.assertEqual(self.salida.asientos_disponibles, 4)
        reserva.estado = 'cancelada'
        reserva.save()
        self.assertEqual(self.salida.asientos_disponibles, 8)

    def test_salida_sin_capacidad_no_limita(self):
        self.salida.capacidad = None
        self.salida.save()
        services.crear_reserva(**self.datos(50))
        self.assertEqual(Reserva.objects.count(), 1)

    def test_no_puede_reservar_cero_asientos(self):
        with self.assertRaises(services.ErrorReserva):
            services.crear_reserva(**self.datos(0))

    def test_salida_inactiva_no_se_reserva(self):
        self.salida.activo = False
        self.salida.save()
        with self.assertRaises(services.SalidaNoReservable):
            services.crear_reserva(**self.datos(1))


class IncreaseAsientosTest(BaseReservaTest):
    def test_subir_asientos_revalida_capacidad(self):
        """El agujero clasico: agrandar una reserva sin control."""
        services.crear_reserva(**self.datos(2))
        segunda = services.crear_reserva(**self.datos(6, email='b@example.com'))
        self.assertEqual(self.salida.asientos_disponibles, 0)

        # Ocupadas por otros: 2. Solo puede llevar 6, no 7.
        with self.assertRaises(services.SinCapacidad):
            services.actualizar_reserva(segunda, cantidad_asientos=7)

        segunda.refresh_from_db()
        self.assertEqual(segunda.cantidad_asientos, 6)

    def test_ampliar_dentro_de_lo_disponible(self):
        reserva = services.crear_reserva(**self.datos(2))
        services.actualizar_reserva(reserva, cantidad_asientos=5)
        reserva.refresh_from_db()
        self.assertEqual(reserva.cantidad_asientos, 5)
        self.assertEqual(self.salida.asientos_disponibles, 3)

    def test_editar_sin_tocar_asientos_no_falla(self):
        reserva = services.crear_reserva(**self.datos(8))
        services.actualizar_reserva(reserva, nombre='Ana Maria')
        reserva.refresh_from_db()
        self.assertEqual(reserva.nombre, 'Ana Maria')

    def test_ampliar_ignorando_la_propia_reserva(self):
        """No puede contarse a si misma como ocupacion ajena."""
        reserva = services.crear_reserva(**self.datos(8))
        services.actualizar_reserva(reserva, cantidad_asientos=8)
        reserva.refresh_from_db()
        self.assertEqual(reserva.cantidad_asientos, 8)


class CodigoUnicoTest(BaseReservaTest):
    def test_formato_del_codigo(self):
        reserva = services.crear_reserva(**self.datos(1))
        self.assertTrue(reserva.codigo.startswith('P1B-'))
        self.assertEqual(len(reserva.codigo), 10)

    def test_codigos_distintos(self):
        # Salida sin capacidad declarada: aca se prueba el codigo, no el limite.
        salida = Salida.objects.create(
            ruta=self.ruta, dia_semana='mar', hora_salida='10:00',
            precio_base=Decimal('15000.00'),
        )
        codigos = {
            services.crear_reserva(**self.datos(1, salida=salida, email=f'{i}@e.com')).codigo
            for i in range(25)
        }
        self.assertEqual(len(codigos), 25)

    def test_reintenta_ante_colision(self):
        """Si el indice unico rebota, el servicio genera otro codigo."""
        codigos = iter(['P1B-AAAAAA', 'P1B-AAAAAA', 'P1B-BBBBBB'])
        original = services._nuevo_codigo
        services._nuevo_codigo = lambda: next(codigos)
        try:
            Reserva.objects.create(
                salida=self.salida,
                fecha_viaje=date.today(),
                nombre='Ocupante',
                email='o@example.com',
                telefono='+5493500000000',
                cantidad_asientos=1,
                codigo='P1B-AAAAAA',
            )
            reserva = services.crear_reserva(**self.datos(1))
            self.assertEqual(reserva.codigo, 'P1B-BBBBBB')
        finally:
            services._nuevo_codigo = original

    def test_el_indice_unico_es_la_garantia_real(self):
        """Aun sin el servicio, la base no admite codigos repetidos."""
        def crear(nombre, email, codigo):
            return Reserva.objects.create(
                salida=self.salida,
                fecha_viaje=date.today(),
                nombre=nombre,
                email=email,
                telefono='+5493500000000',
                cantidad_asientos=1,
                codigo=codigo,
            )

        # El primero entra bien.
        crear('Primero', '1@example.com', 'P1B-ZZZZZZ')

        # El segundo con el mismo codigo lo rebota la base, no la app.
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                crear('Duplicado', '2@example.com', 'P1B-ZZZZZZ')

        self.assertEqual(Reserva.objects.filter(codigo='P1B-ZZZZZZ').count(), 1)


class PrecioActualTest(BaseReservaTest):
    def test_precio_base_sin_promocion(self):
        self.assertEqual(self.salida.precio_actual, Decimal('15000.00'))

    def test_precio_promocional_cuando_esta_activa(self):
        self.salida.precio_promocional = Decimal('12000.00')
        self.salida.promocion_activa = True
        self.assertEqual(self.salida.precio_actual, Decimal('12000.00'))

    def test_precio_promocional_inactivo_no_se_aplica(self):
        self.salida.precio_promocional = Decimal('12000.00')
        self.salida.promocion_activa = False
        self.assertEqual(self.salida.precio_actual, Decimal('15000.00'))


class RestriccionesBaseTest(BaseReservaTest):
    """La base rejects lo que la aplicacion deberia rejectar."""

    def test_no_puede_guardar_cero_asientos(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Reserva.objects.create(
                    salida=self.salida,
                    fecha_viaje=date.today(),
                    nombre='Cero',
                    email='c@example.com',
                    telefono='+5493500000000',
                    cantidad_asientos=0,
                    codigo='P1B-CERO00',
                )

    def test_no_puede_guardar_precio_negativo(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Salida.objects.create(
                    ruta=self.ruta, dia_semana='jue', hora_salida='09:00',
                    precio_base=Decimal('-500.00'),
                )
