from django.db import models


class Servicio(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion_corta = models.CharField(max_length=200, help_text='Texto breve para la tarjeta')
    descripcion_larga = models.TextField(blank=True)
    icono = models.CharField(max_length=50, help_text='Nombre del icono Lucide', blank=True)
    imagen = models.ImageField(upload_to='servicios/', blank=True, null=True)
    activo = models.BooleanField(default=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'
        ordering = ['orden']

    def __str__(self):
        return self.nombre
