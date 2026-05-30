from django.contrib import admin
from .models import Ruta, Salida


class SalidaInline(admin.TabularInline):
    model = Salida
    extra = 1


@admin.register(Ruta)
class RutaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'origen', 'destino', 'activo']
    list_editable = ['activo']
    inlines = [SalidaInline]


@admin.register(Salida)
class SalidaAdmin(admin.ModelAdmin):
    list_display = ['ruta', 'dia_semana', 'hora_salida', 'precio_base', 'activo']
    list_filter = ['dia_semana', 'activo']
    list_editable = ['activo']
