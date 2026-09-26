from django.db import models
from flota.models import Vehiculo
from servicios.models import Servicio
from usuarios.models import Cliente


class SolicitudCharter(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('cotizado', 'Cotizado'),
        ('aceptado', 'Aceptado'),
        ('rechazado', 'Rechazado'),
        ('cancelado', 'Cancelado'),
    ]

    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    telefono = models.CharField('Teléfono', max_length=50)

    cliente = models.ForeignKey(
        Cliente, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Cliente'
    )

    origen = models.CharField('Origen', max_length=200)
    destino = models.CharField('Destino', max_length=200)
    fecha_viaje = models.DateField('Fecha del viaje')
    cantidad_pasajeros = models.PositiveIntegerField('Cantidad de pasajeros')

    tipo_vehiculo = models.ForeignKey(
        Vehiculo, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Tipo de vehículo preferido'
    )
    tipo_servicio = models.ForeignKey(
        Servicio, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Tipo de servicio'
    )

    comentarios = models.TextField(blank=True)

    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    precio_cotizado = models.DecimalField(
        'Precio cotizado', max_digits=10, decimal_places=2,
        null=True, blank=True
    )
    notas_internas = models.TextField(blank=True, help_text='Notas solo para el admin')

    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Solicitud de viaje'
        verbose_name_plural = 'Solicitudes de viaje'
        ordering = ['-creado']

    def __str__(self):
        return f'{self.nombre} - {self.origen} → {self.destino} ({self.fecha_viaje})'
