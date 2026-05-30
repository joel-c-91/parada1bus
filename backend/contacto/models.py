from django.db import models


class MensajeContacto(models.Model):
    MOTIVOS = [
        ('consulta', 'Consulta general'),
        ('presupuesto', 'Solicitar presupuesto'),
        ('reclamo', 'Reclamo'),
        ('otro', 'Otro'),
    ]

    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    telefono = models.CharField('Teléfono', max_length=50, blank=True)
    motivo = models.CharField(max_length=20, choices=MOTIVOS, default='consulta')
    mensaje = models.TextField()

    leido = models.BooleanField(default=False)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Mensaje de contacto'
        verbose_name_plural = 'Mensajes de contacto'
        ordering = ['-creado']

    def __str__(self):
        return f'{self.nombre} - {self.get_motivo_display()}'
