"""Copia la capacidad del vehiculo a las salidas que no tienen la suya.

Se corre a mano despues de dar de alta o recambiar un vehiculo. No se
automatiza porque pisar una capacidad que el operador ajusto a mano seria
peor que tenerla desactualizada.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from rutas.models import Salida


class Command(BaseCommand):
    help = 'Copia la capacidad del vehiculo a las salidas sin capacidad propia.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--forzar',
            action='store_true',
            help='Sobrescribe tambien las salidas que ya tienen capacidad.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra que cambiaria sin escribir nada.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        forzar = options['forzar']
        dry_run = options['dry_run']

        queryset = Salida.objects.select_related('vehiculo').exclude(
            vehiculo__isnull=True
        )
        if not forzar:
            queryset = queryset.filter(capacidad__isnull=True)

        actualizadas = 0
        for salida in queryset:
            nueva = salida.vehiculo.capacidad
            if not forzar and salida.capacidad == nueva:
                continue
            if dry_run:
                self.stdout.write(
                    f'  [dry-run] salida {salida.id} ({salida}): '
                    f'capacidad {salida.capacidad} -> {nueva}'
                )
            else:
                salida.capacidad = nueva
                salida.save(update_fields=['capacidad'])
            actualizadas += 1

        sin_vehiculo = Salida.objects.filter(vehiculo__isnull=True).count()
        sin_capacidad = Salida.objects.filter(capacidad__isnull=True).count()

        self.stdout.write(self.style.SUCCESS(
            f'Salidas actualizadas: {actualizadas}'
            + (' (dry run, no se escribio nada)' if dry_run else '')
        ))
        if sin_vehiculo:
            self.stdout.write(self.style.WARNING(
                f'Salidas sin vehiculo asignado: {sin_vehiculo} '
                '(no se les puede derivar capacidad)'
            ))
        if sin_capacidad:
            self.stdout.write(self.style.WARNING(
                f'Salidas sin capacidad y sin vehiculo: {sin_capacidad} '
                '(quedan sin control de plazas)'
            ))
