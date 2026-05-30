from django.db import models


class Vehiculo(models.Model):
    TIPOS = [
        ('van', 'Van'),
        ('minibus', 'Minibús'),
        ('bus', 'Bus'),
    ]

    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    capacidad = models.PositiveIntegerField(help_text='Cantidad máxima de pasajeros')
    patente = models.CharField('Patente', max_length=20, unique=True)
    descripcion = models.TextField(blank=True)
    imagen = models.ImageField(upload_to='vehiculos/', blank=True, null=True)
    activo = models.BooleanField(default=True)
    orden = models.PositiveIntegerField(default=0, help_text='Orden de aparición en la web')

    class Meta:
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Flota'
        ordering = ['orden']

    def __str__(self):
        return f'{self.nombre} ({self.get_tipo_display()})'
