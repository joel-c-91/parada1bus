from django.db import models
from django.db.models import Sum
from rutas.models import Salida
from usuarios.models import Cliente

# Estados que ocupan un lugar en el vehiculo. Cancelar o rechazar una
# reserva libera el asiento automaticamente.
ESTADOS_QUE_CONSUMEN_CAPACIDAD = ('pendiente', 'confirmada', 'completada')


class ReservaQuerySet(models.QuerySet):
    def consumen_capacidad(self):
        """Reservas que ocupan asientos en su salida."""
        return self.filter(estado__in=ESTADOS_QUE_CONSUMEN_CAPACIDAD)

    def asientos_ocupados(self):
        total = self.consumen_capacidad().aggregate(
            total=Sum('cantidad_asientos')
        )['total']
        return total or 0


class Reserva(models.Model):
    objects = ReservaQuerySet.as_manager()

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
    ]

    salida = models.ForeignKey(
        Salida, on_delete=models.CASCADE, related_name='reservas'
    )
    fecha_viaje = models.DateField('Fecha del viaje')

    cliente = models.ForeignKey(
        Cliente, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Cliente'
    )

    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    telefono = models.CharField('Teléfono', max_length=50)
    cantidad_asientos = models.PositiveIntegerField('Cantidad de asientos')
    codigo = models.CharField('Código de reserva', max_length=20, unique=True)

    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    monto_total = models.DecimalField(
        'Monto total', max_digits=10, decimal_places=2,
        null=True, blank=True
    )
    pagado = models.BooleanField(default=False)
    metodo_pago = models.CharField('Método de pago', max_length=50, blank=True)

    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-creado']
        indexes = [
            # Todas las pantallas ordenan por '-creado' y filtran por estado.
            # Sin esto PostgreSQL ordena la tabla entera en cada consulta.
            models.Index(fields=['-creado'], name='reserva_creado_idx'),
            models.Index(fields=['salida', 'estado'], name='reserva_salida_estado_idx'),
        ]
        constraints = [
            # Nadie reserva cero asientos. PositiveIntegerField permite 0.
            models.CheckConstraint(
                condition=models.Q(cantidad_asientos__gte=1),
                name='reserva_cantidad_asientos_min_1',
            ),
        ]

    def __str__(self):
        return f'{self.codigo} - {self.nombre} ({self.fecha_viaje})'
