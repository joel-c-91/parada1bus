from django.db import models
from rutas.models import Salida
from usuarios.models import Cliente


class Reserva(models.Model):
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

    def __str__(self):
        return f'{self.codigo} - {self.nombre} ({self.fecha_viaje})'
