from rest_framework import serializers
from .models import Vehiculo


class VehiculoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Vehiculo
        fields = ['id', 'nombre', 'tipo', 'tipo_display', 'capacidad',
                  'descripcion', 'imagen', 'activo', 'orden']


class AdminVehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = ['id', 'nombre', 'tipo', 'capacidad', 'patente',
                  'descripcion', 'imagen', 'activo', 'orden']
