from django.core.validators import FileExtensionValidator
from django.db import models

# Las fotos de las secciones pesan: entran en la portada y se descargan en cada
# visita. Un TIF de 40 MB subido por error deja la pagina lenta para todos.
TAMANO_MAXIMO = 8 * 1024 * 1024  # 8 MB

EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'webp']


def validar_tamano(imagen):
    if imagen.size > TAMANO_MAXIMO:
        raise ValueError(
            f'La imagen pesa {imagen.size / 1024 / 1024:.1f} MB. '
            f'El máximo permitido es {TAMANO_MAXIMO / 1024 / 1024:.0f} MB.'
        )


class ContenidoSitio(models.Model):
    """Una foto para una seccion del sitio.

    Cada fila es un espacio editable: el admin sube la foto y decide si se
    muestra. ``clave`` es el contrato con el frontend, asi que cambiar el
    orden, el titulo o esconder una seccion nunca rompe el sitio, y agregar
    una seccion nueva no requiere migracion.
    """

    clave = models.SlugField(
        'Clave', max_length=60, unique=True,
        help_text='Identificador tecnico que usa el sitio. No lo cambies si ya esta en uso.',
    )
    titulo = models.CharField('Título', max_length=100, help_text='Para identificar la sección en el admin.')

    imagen = models.ImageField(
        'Imagen', upload_to='sitio/', blank=True,
        validators=[FileExtensionValidator(EXTENSIONES_PERMITIDAS), validar_tamano],
        help_text=' JPG, PNG o WEBP, hasta 8 MB. Se usa de fondo y se recorta a la sección.',
    )
    alt_imagen = models.CharField(
        'Texto alternativo', max_length=200, blank=True,
        help_text='Describe la imagen para lectores de pantalla y buscadores.',
    )

    orden = models.PositiveIntegerField('Orden', default=0)
    visible = models.BooleanField('Visible en el sitio', default=True)
    creado = models.DateTimeField('Creado', auto_now_add=True)
    actualizado = models.DateTimeField('Actualizado', auto_now=True)

    class Meta:
        verbose_name = 'Contenido del sitio'
        verbose_name_plural = 'Contenidos del sitio'
        ordering = ['orden', 'clave']

    def __str__(self):
        return f'{self.titulo or self.clave}'

    @property
    def tiene_imagen(self):
        return bool(self.imagen)

    def delete(self, *args, **kwargs):
        """Borrar el registro no debe dejar el archivo huerfano en disco."""
        archivo = self.imagen
        super().delete(*args, **kwargs)
        if archivo:
            archivo.delete(save=False)
