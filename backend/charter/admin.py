from django.contrib import admin
from .models import SolicitudCharter

@admin.register(SolicitudCharter)
class SolicitudCharterAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'origen', 'destino', 'fecha_viaje', 'estado', 'creado']
    list_filter = ['estado', 'fecha_viaje']
    list_editable = ['estado']
    search_fields = ['nombre', 'email', 'telefono']
    readonly_fields = ['creado', 'actualizado']
    fieldsets = [
        ('Datos del cliente', {
            'fields': ['nombre', 'email', 'telefono']
        }),
        ('Detalles del viaje', {
            'fields': ['origen', 'destino', 'fecha_viaje', 'cantidad_pasajeros']
        }),
        ('Preferencias', {
            'fields': ['tipo_vehiculo', 'tipo_servicio', 'comentarios']
        }),
        ('Gestión', {
            'fields': ['estado', 'precio_cotizado', 'notas_internas']
        }),
        ('Fechas', {
            'fields': ['creado', 'actualizado']
        }),
    ]
