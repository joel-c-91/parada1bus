from datetime import date, timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import ProtectedError
from django.test import TestCase

from usuarios.models import Cliente

from .models import CategoriaGasto, Cheque, Gasto, Pago


class ClienteTest(TestCase):
    def test_se_crea_cliente_solo_con_nombre(self):
        cliente = Cliente.objects.create(nombre='Transportes del Sur')
        self.assertEqual(cliente.nombre, 'Transportes del Sur')

    def test_str_devuelve_el_nombre(self):
        cliente = Cliente.objects.create(nombre='Transportes del Sur')
        self.assertEqual(str(cliente), 'Transportes del Sur')

    def test_campos_opcionales_por_defecto_estan_vacios(self):
        cliente = Cliente.objects.create(nombre='X')
        self.assertEqual(cliente.email, '')
        self.assertEqual(cliente.telefono, '')
        self.assertEqual(cliente.direccion, '')
        self.assertEqual(cliente.notas, '')


class CategoriaGastoTest(TestCase):
    def test_no_se_pueden_crear_dos_categorias_con_el_mismo_nombre(self):
        CategoriaGasto.objects.create(nombre='Combustible')
        with self.assertRaises(Exception):
            CategoriaGasto.objects.create(nombre='Combustible')


class ValidacionMontosTest(TestCase):
    """El monto tiene MinValueValidator(0.01): protege contra cargas de $0 o negativas,
    que en un sistema de control financiero son el error mas comun."""

    def test_pago_rechaza_monto_cero(self):
        pago = Pago(monto=Decimal('0'), fecha=date(2026, 3, 1))
        with self.assertRaises(ValidationError):
            pago.full_clean()

    def test_pago_rechaza_monto_negativo(self):
        pago = Pago(monto=Decimal('-500'), fecha=date(2026, 3, 1))
        with self.assertRaises(ValidationError):
            pago.full_clean()

    def test_pago_acepta_monto_valido(self):
        pago = Pago(monto=Decimal('0.01'), fecha=date(2026, 3, 1))
        pago.full_clean()  # no debe lanzar

    def test_gasto_rechaza_monto_negativo(self):
        gasto = Gasto(
            categoria=CategoriaGasto.objects.create(nombre='Peajes'),
            monto=Decimal('-1'),
            fecha=date(2026, 3, 1),
        )
        with self.assertRaises(ValidationError):
            gasto.full_clean()

    def test_cheque_rechaza_monto_negativo(self):
        cheque = Cheque(
            cliente=Cliente.objects.create(nombre='Cliente X'),
            numero='CHQ-999', banco='Nacion',
            monto=Decimal('-100'), fecha_emision=date(2026, 3, 1),
        )
        with self.assertRaises(ValidationError):
            cheque.full_clean()


class IntegridadRelacionalTest(TestCase):
    """Las relaciones usan on_delete=PROTECT para no perder informacion financiera
    silenciosamente al borrar un cliente o una categoria."""

    def setUp(self):
        self.categoria = CategoriaGasto.objects.create(nombre='Combustible')
        self.cliente = Cliente.objects.create(nombre='Cliente Protegido')

    def test_no_se_puede_borrar_categoria_en_uso(self):
        Gasto.objects.create(
            categoria=self.categoria, monto=Decimal('1000'), fecha=date(2026, 3, 1)
        )
        with self.assertRaises(ProtectedError):
            self.categoria.delete()

    def test_no_se_puede_borrar_cliente_con_cheques(self):
        Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-001', banco='Galicia',
            monto=Decimal('1000'), fecha_emision=date(2026, 3, 1),
        )
        with self.assertRaises(ProtectedError):
            self.cliente.delete()

    def test_no_se_puede_borrar_categoria_sin_usar(self):
        # control: la categoria libre si se puede borrar
        categoria = CategoriaGasto.objects.create(nombre='Libre')
        categoria.delete()
        self.assertFalse(CategoriaGasto.objects.filter(nombre='Libre').exists())

    def test_borrar_cliente_deja_el_pago_sin_cliente_en_vez_de_borrarlo(self):
        # Pago usa SET_NULL a proposito: el pago es un hecho contable y no debe
        # desaparecer aunque se borre el cliente. Cheque usa PROTECT porque el
        # cheque identifies al emisor.
        pago = Pago.objects.create(
            cliente=self.cliente, monto=Decimal('5000'), fecha=date(2026, 3, 1)
        )
        self.cliente.delete()
        pago.refresh_from_db()
        self.assertIsNone(pago.cliente)
        self.assertTrue(Pago.objects.filter(pk=pago.pk).exists())


class ChequeEstadoInicialTest(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(nombre='Cliente Cheques')

    def test_estado_por_defecto_es_en_cartera(self):
        cheque = Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-001', banco='Galicia',
            monto=Decimal('10000'), fecha_emision=date(2026, 2, 1),
        )
        self.assertEqual(cheque.estado, 'en_cartera')

    def test_numero_de_cheque_es_unico(self):
        Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-DUP', banco='Galicia',
            monto=Decimal('10000'), fecha_emision=date(2026, 2, 1),
        )
        with self.assertRaises(Exception):
            Cheque.objects.create(
                cliente=self.cliente, numero='CHQ-DUP', banco='Nacion',
                monto=Decimal('20000'), fecha_emision=date(2026, 2, 2),
            )

    def test_fecha_vencimiento_es_opcional(self):
        cheque = Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-SIN-VTO', banco='Galicia',
            monto=Decimal('10000'), fecha_emision=date(2026, 2, 1),
        )
        self.assertIsNone(cheque.fecha_vto)


class ChequeTransicionesTest(TestCase):
    """La maquina de estados de los cheques es la logica de negocio mas delicada de
    la app: un cheque entregado no puede volver a 'en cartera' porque el banco ya
    lo cobro. Estos tests fijan ese contrato."""

    def setUp(self):
        self.cliente = Cliente.objects.create(nombre='Cliente Transiciones')
        self.cheque = Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-STATE', banco='Galicia',
            monto=Decimal('75000'), fecha_emision=date(2026, 2, 1),
        )

    def _transicionar(self, estado):
        self.cheque.estado = estado
        self.cheque.full_clean()
        self.cheque.save()

    # ── transiciones validas ────────────────────────────────────────────────
    def test_en_cartera_puede_pasar_a_depositado(self):
        self._transicionar('depositado')
        self.assertEqual(self.cheque.estado, 'depositado')

    def test_en_cartera_puede_pasar_a_rechazado(self):
        self._transicionar('rechazado')
        self.assertEqual(self.cheque.estado, 'rechazado')

    def test_en_cartera_puede_pasar_a_entregado(self):
        self._transicionar('entregado')
        self.assertEqual(self.cheque.estado, 'entregado')

    def test_depositado_puede_pasar_a_rechazado(self):
        self._transicionar('depositado')
        self._transicionar('rechazado')
        self.assertEqual(self.cheque.estado, 'rechazado')

    def test_rechazado_puede_volver_a_depositado(self):
        self._transicionar('rechazado')
        self._transicionar('depositado')
        self.assertEqual(self.cheque.estado, 'depositado')

    # ── transiciones invalidas ───────────────────────────────────────────────
    def test_entregado_es_terminal_no_puede_volver_a_cartera(self):
        self._transicionar('entregado')
        with self.assertRaises(ValidationError):
            self._transicionar('en_cartera')

    def test_entregado_no_puede_pasar_a_depositado(self):
        self._transicionar('entregado')
        with self.assertRaises(ValidationError):
            self._transicionar('depositado')

    def test_depositado_no_puede_pasar_directamente_a_entregado(self):
        # caso traicionero: el cheque ya esta en el banco, no se puede marcar
        # como entregado al cliente sin pasar por el rechazo.
        self._transicionar('depositado')
        with self.assertRaises(ValidationError):
            self._transicionar('entregado')

    def test_no_se_puede_saltar_de_cartera_a_un_estado_inexistente(self):
        with self.assertRaises(ValidationError):
            self._transicionar('inventado')

    # ── el mensaje de error es util ──────────────────────────────────────────
    def test_el_error_explica_que_transiciones_si_valen(self):
        self._transicionar('entregado')
        with self.assertRaises(ValidationError) as ctx:
            self._transicionar('en_cartera')
        mensaje = str(ctx.exception)
        self.assertIn('Entregado', mensaje)
        self.assertIn('ninguna', mensaje)

    # ── guardar el mismo estado no es una transicion ────────────────────────
    def test_persistir_sin_cambiar_el_estado_es_valido(self):
        # no debe romper al re-guardar un cheque que ya esta en un estado final
        self._transicionar('entregado')
        self.cheque.notas = 'nota agregada despues'
        self.cheque.full_clean()
        self.cheque.save()
        self.assertEqual(self.cheque.estado, 'entregado')

    def test_validar_cheque_nuevo_no_exige_transicion(self):
        nuevo = Cheque(
            cliente=self.cliente, numero='CHQ-NUEVO', banco='Nacion',
            monto=Decimal('1000'), fecha_emision=date(2026, 3, 1),
            estado='rechazado',
        )
        nuevo.full_clean()  # no debe lanzar: es alta, no transicion


class ChequeVencimientoTest(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(nombre='Cliente Vtos')

    def test_cheque_con_fecha_vencimiento_pasada(self):
        cheque = Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-VTO', banco='Galicia',
            monto=Decimal('10000'), fecha_emision=date(2026, 1, 1),
            fecha_vto=date(2026, 1, 31),
        )
        self.assertLess(cheque.fecha_vto, date.today() + timedelta(days=1))

    def test_str_del_cheque_incluye_numero_cliente_y_monto(self):
        cheque = Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-STR', banco='Galicia',
            monto=Decimal('1234.56'), fecha_emision=date(2026, 2, 1),
        )
        self.assertIn('CHQ-STR', str(cheque))
        self.assertIn('Cliente Vtos', str(cheque))
        self.assertIn('1234.56', str(cheque))


class OrdenamientoTest(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(nombre='Cliente Orden')

    def test_los_cheques_ordenan_por_fecha_de_emision_descendente(self):
        Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-OLD', banco='G',
            monto=Decimal('100'), fecha_emision=date(2026, 1, 1),
        )
        Cheque.objects.create(
            cliente=self.cliente, numero='CHQ-NEW', banco='G',
            monto=Decimal('200'), fecha_emision=date(2026, 6, 1),
        )
        numeros = [c.numero for c in Cheque.objects.all()]
        self.assertEqual(numeros, ['CHQ-NEW', 'CHQ-OLD'])

    def test_las_categorias_ordenan_por_nombre(self):
        CategoriaGasto.objects.create(nombre='Zeta')
        CategoriaGasto.objects.create(nombre='Alfa')
        self.assertEqual(
            [c.nombre for c in CategoriaGasto.objects.all()], ['Alfa', 'Zeta']
        )
