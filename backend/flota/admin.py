from django.contrib import admin
from .models import Vehiculo

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'capacidad', 'patente', 'activo', 'orden']
    list_filter = ['tipo', 'activo']
    list_editable = ['activo', 'orden']
    search_fields = ['nombre', 'patente']
