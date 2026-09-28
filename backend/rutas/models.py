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
    capacidad = models.PositiveIntegerField(
        'Capacidad (asientos)', null=True, blank=True,
        help_text=(
            'Asientos que se pueden vender en esta salida. '
            'Si la dejes vacia se toma la del vehiculo al crearla. '
            'Vacio = sin control de plazas.'
        ),
    )
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Salida'
        verbose_name_plural = 'Salidas'
        ordering = ['ruta', 'dia_semana', 'hora_salida']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(precio_base__gte=0),
                name='salida_precio_base_no_negativo',
            ),
            models.CheckConstraint(
                condition=models.Q(precio_promocional__gte=0) | models.Q(precio_promocional__isnull=True),
                name='salida_precio_promocional_no_negativo',
            ),
        ]

    def __str__(self):
        dia = self.get_dia_semana_display()
        return f'{self.ruta} - {dia} {self.hora_salida}'

    @property
    def precio_actual(self):
        """Precio de venta: el promocional solo si la promocion esta activa."""
        if self.promocion_activa and self.precio_promocional is not None:
            return self.precio_promocional
        return self.precio_base

    def save(self, *args, **kwargs):
        # Al crearse con un vehiculo asignado y sin capacidad propia, se
        # hereda la del vehiculo. Solo al crear: despues la capacidad es del
        # operador, incluido el vacio como "sin control". Si la capacidad
        # del vehiculo cambia, esta salida conserva la suya.
        if self._state.adding and self.vehiculo_id and self.capacidad is None:
            self.capacidad = self.vehiculo.capacidad
        super().save(*args, **kwargs)

    @property
    def asientos_ocupados(self):
        return self.reservas.asientos_ocupados()

    @property
    def asientos_disponibles(self):
        """None cuando la salida no tiene capacidad declarada."""
        if self.capacidad is None:
            return None
        return max(0, self.capacidad - self.asientos_ocupados)
