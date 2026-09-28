from django.contrib import admin
from django.utils.html import format_html

from .models import ContenidoSitio


@admin.register(ContenidoSitio)
class ContenidoSitioAdmin(admin.ModelAdmin):
    """Carga de fotos de las secciones del sitio.

    Se listan todas juntas con su miniatura: el admin tiene que ver de un
    vistazo que foto va donde, sin abrir cada una.
    """

    list_display = ['miniatura', 'titulo', 'clave', 'visible', 'orden', 'actualizado']
    list_display_links = ['miniatura', 'titulo']
    list_editable = ['visible', 'orden']
    list_filter = ['visible']
    search_fields = ['titulo', 'clave', 'alt_imagen']
    # `clave` es el contrato con el frontend. Si el dueño la renombra, la foto
    # deja de aplicarse a su sección sin ningún error visible: el sitio cae
    # silenciosamente al diseño por defecto. No se edita desde el admin.
    readonly_fields = ['clave', 'miniatura_ampliada', 'creado', 'actualizado']
    ordering = ['orden', 'clave']

    fieldsets = (
        ('Sección', {
            'fields': ('titulo', 'clave'),
        }),
        ('Foto', {
            'fields': ('imagen', 'miniatura_ampliada', 'alt_imagen'),
        }),
        ('Publicación', {
            'fields': ('visible', 'orden'),
        }),
        ('Auditoría', {
            'classes': ('collapse',),
            'fields': ('creado', 'actualizado'),
        }),
    )

    @admin.display(description='Foto')
    def miniatura(self, obj):
        if not obj.tiene_imagen:
            return format_html('<span style="color:#999">sin foto</span>')
        return format_html(
            '<img src="{}" style="height:48px;width:80px;object-fit:cover;'
            'border-radius:6px;border:1px solid #ddd" />',
            obj.imagen.url,
        )

    @admin.display(description='Vista previa')
    def miniatura_ampliada(self, obj):
        if not obj.tiene_imagen:
            return 'Todavía no cargaste una imagen para esta sección.'
        return format_html(
            '<img src="{}" style="max-width:520px;max-height:280px;'
            'object-fit:cover;border-radius:10px;border:1px solid #ddd" />',
            obj.imagen.url,
        )
