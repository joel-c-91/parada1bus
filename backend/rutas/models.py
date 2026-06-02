from django.db import models
from flota.models import Vehiculo


class Ruta(models.Model):
    nombre = models.CharField(max_length=100)
    origen = models.CharField(max_length=200)
    destino = models.CharField(max_length=200)
    duracion_estimada = models.CharField('Duración estimada', max_length=50, blank=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    orden = models.PositiveIntegerField(default=0)
    imagen = models.ImageField(upload_to='rutas/', null=True, blank=True)

    class Meta:
        verbose_name = 'Ruta'
        verbose_name_plural = 'Rutas'
        ordering = ['orden']

    def __str__(self):
        return f'{self.origen} → {self.destino}'


class Salida(models.Model):
    DIAS = [
        ('lun', 'Lunes'),
        ('mar', 'Martes'),
        ('mie', 'Miércoles'),
        ('jue', 'Jueves'),
        ('vie', 'Viernes'),
        ('sab', 'Sábado'),
        ('dom', 'Domingo'),
    ]

    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE, related_name='salidas')
    dia_semana = models.CharField('Día de la semana', max_length=3, choices=DIAS)
    hora_salida = models.TimeField('Hora de salida')
    vehiculo = models.ForeignKey(
        Vehiculo, on_delete=models.SET_NULL, null=True, blank=True
    )
    precio_base = models.DecimalField(
        'Precio base', max_digits=10, decimal_places=2
    )
    precio_promocional = models.DecimalField(
        'Precio promocional', max_digits=10, decimal_places=2,
        null=True, blank=True
    )
    promocion_activa = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Salida'
        verbose_name_plural = 'Salidas'
        ordering = ['ruta', 'dia_semana', 'hora_salida']

    def __str__(self):
        dia = self.get_dia_semana_display()
        return f'{self.ruta} - {dia} {self.hora_salida}'
