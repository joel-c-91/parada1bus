from django.contrib import admin
from .models import MensajeContacto

@admin.register(MensajeContacto)
class MensajeContactoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'email', 'motivo', 'leido', 'creado']
    list_filter = ['motivo', 'leido']
    list_editable = ['leido']
    search_fields = ['nombre', 'email', 'mensaje']
    readonly_fields = ['creado']
