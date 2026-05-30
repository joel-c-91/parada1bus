from django.contrib import admin
from .models import Reserva

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'fecha_viaje', 'salida', 'estado', 'pagado']
    list_filter = ['estado', 'pagado', 'fecha_viaje']
    list_editable = ['estado', 'pagado']
    search_fields = ['codigo', 'nombre', 'email']
    readonly_fields = ['codigo', 'creado', 'actualizado']
