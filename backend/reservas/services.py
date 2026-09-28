"""Reglas de negocio de las reservas.

Dos invariantes que no pueden depender de que el llamador se acuerde:

1. **No se sobrevende.** La capacidad se verifica contra la fila de la Salida
   bloqueada con ``select_for_update()``, de modo que dos pedidos
   simultaneos sobre la misma salida se serializan en PostgreSQL en vez de
   leer ambos el mismo contador y pasar los dos.

2. **El codigo es unico de verdad.** La unicidad la garantiza el indice unico
   de la base, no un ``exists()`` previo: hay carrera entre verificar e
   insertar. Se reintenta ante ``IntegrityError`` dentro de un savepoint.
"""

import secrets

from django.db import IntegrityError, transaction
from django.db.models import Sum

from reservas.models import Reserva
from rutas.models import Salida

MAX_INTENTOS_CODIGO = 5
PREFIJO_CODIGO = 'P1B-'


class ErrorReserva(Exception):
    """Error de dominio que el serializer traduce a 400."""


class SinCapacidad(ErrorReserva):
    def __init__(self, disponibles):
        self.disponibles = disponibles
        super().__init__(
            f'No quedan asientos suficientes. Hay {disponibles} disponible(s).'
        )


class SalidaNoReservable(ErrorReserva):
    def __init__(self):
        super().__init__('Esta salida no está disponible para reservas.')


def _nuevo_codigo():
    """6 caracteres hexadecimales: ~16 millones de combinaciones.

    Se redujeron los reintentos porque el codigo es un identificador que el
    cliente anota al teléfono, no un token de seguridad.
    """
    return PREFIJO_CODIGO + secrets.token_hex(3).upper()


def _verificar_capacidad(salida, cantidad, excluir_pk=None):
    if not salida.activo:
        raise SalidaNoReservable()

    if salida.capacidad is None:
        # Sin capacidad declarada no hay limite que respetar. Es una decision
        # explicita del operador, no un olvido: se puede activar en el admin.
        return

    if cantidad < 1:
        raise ErrorReserva('La cantidad de asientos debe ser al menos 1.')

    reservas = salida.reservas.consumen_capacidad()
    if excluir_pk is not None:
        reservas = reservas.exclude(pk=excluir_pk)

    ocupados = reservas.aggregate(total=Sum('cantidad_asientos'))['total'] or 0
    disponibles = salida.capacidad - ocupados

    if cantidad > disponibles:
        raise SinCapacidad(max(0, disponibles))


def _persistir(salida, datos):
    """Inserta reintentando si el codigo choca con otra reserva concurrente."""
    for _ in range(MAX_INTENTOS_CODIGO):
        try:
            # Savepoint propio: si el codigo choca, se revierte solo este
            # intento y la transaccion exterior sigue siendo utilizable.
            with transaction.atomic():
                return Reserva.objects.create(
                    salida=salida, codigo=_nuevo_codigo(), **datos
                )
        except IntegrityError:
            continue

    raise ErrorReserva('No se pudo generar un código de reserva único. Intentá de nuevo.')


def crear_reserva(*, salida, **datos):
    with transaction.atomic():
        # El lock serializa a todos los pedidos de esta salida.
        salida_bloqueada = Salida.objects.select_for_update().get(pk=salida.pk)
        _verificar_capacidad(salida_bloqueada, datos.get('cantidad_asientos', 1))
        return _persistir(salida_bloqueada, datos)


def actualizar_reserva(reserva, **datos):
    """Cambiar la cantidad o la salida revalida la capacidad.

    Subir los asientos de una reserva existente es tan peligroso como crear
    una nueva: sin esto se podria sobrevender una salida que ya estaba llena.
    """
    toca_capacidad = 'cantidad_asientos' in datos or 'salida' in datos
    if not toca_capacidad:
        for campo, valor in datos.items():
            setattr(reserva, campo, valor)
        reserva.save()
        return reserva

    with transaction.atomic():
        salida_bloqueada = Salida.objects.select_for_update().get(pk=reserva.salida_id)
        cantidad = datos.get('cantidad_asientos', reserva.cantidad_asientos)
        _verificar_capacidad(salida_bloqueada, cantidad, excluir_pk=reserva.pk)

        for campo, valor in datos.items():
            setattr(reserva, campo, valor)
        reserva.save()
        return reserva
