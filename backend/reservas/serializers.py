from rest_framework import serializers
from .models import Reserva


class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['id', 'salida', 'fecha_viaje', 'nombre', 'email', 'telefono',
                  'cantidad_asientos', 'codigo', 'estado', 'monto_total',
                  'pagado', 'creado']
        read_only_fields = ['id', 'codigo', 'estado', 'pagado', 'monto_total', 'creado']
