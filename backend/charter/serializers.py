from rest_framework import serializers
from .models import SolicitudCharter


class SolicitudCharterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudCharter
        fields = [
            'id', 'nombre', 'email', 'telefono',
            'origen', 'destino', 'fecha_viaje', 'cantidad_pasajeros',
            'tipo_vehiculo', 'tipo_servicio', 'comentarios',
            'estado', 'creado',
        ]
        read_only_fields = ['id', 'estado', 'creado']

    def validate_fecha_viaje(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError('La fecha del viaje no puede ser en el pasado')
        return value
