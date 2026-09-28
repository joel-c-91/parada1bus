from django.contrib import admin
from .models import Ruta, Salida


class SalidaInline(admin.TabularInline):
    model = Salida
    extra = 1


@admin.register(Ruta)
class RutaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'origen', 'destino', 'activo']
    list_editable = ['activo']
    # Requisito de autocomplete_fields en SalidaAdmin.
    search_fields = ['nombre', 'origen', 'destino']
    inlines = [SalidaInline]


@admin.register(Salida)
class SalidaAdmin(admin.ModelAdmin):
    list_display = ['ruta', 'dia_semana', 'hora_salida', 'precio_actual', 'capacidad',
                    'asientos_disponibles', 'vehiculo', 'activo']
    list_filter = ['dia_semana', 'activo', 'promocion_activa']
    list_editable = ['activo']
    autocomplete_fields = ['ruta', 'vehiculo']

    @admin.display(description='Precio')
    def precio_actual(self, obj):
        return obj.precio_actual

    @admin.display(description='Disponibles')
    def asientos_disponibles(self, obj):
        disponibles = obj.asientos_disponibles
        if disponibles is None:
            return 'sin control'
        if disponibles == 0:
            return 'completo'
        return f'{disponibles} de {obj.capacidad}'
