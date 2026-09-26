from django.db import models


class Cliente(models.Model):
    nombre = models.CharField('Nombre', max_length=100)
    email = models.EmailField('Email', blank=True, default='')
    telefono = models.CharField('Teléfono', max_length=50, blank=True, default='')
    direccion = models.CharField('Dirección', max_length=200, blank=True, default='')
    notas = models.TextField('Notas', blank=True, default='')
    creado = models.DateTimeField('Creado', auto_now_add=True)
    actualizado = models.DateTimeField('Actualizado', auto_now=True)

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-creado']

    def __str__(self):
        return self.nombre
