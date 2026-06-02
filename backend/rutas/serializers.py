from rest_framework import serializers
from .models import Ruta, Salida
from flota.serializers import VehiculoSerializer


class SalidaSerializer(serializers.ModelSerializer):
    vehiculo_data = VehiculoSerializer(source='vehiculo', read_only=True)
    dia_display = serializers.CharField(source='get_dia_semana_display', read_only=True)

    class Meta:
        model = Salida
        fields = ['id', 'dia_semana', 'dia_display', 'hora_salida',
                  'vehiculo', 'vehiculo_data', 'precio_base', 'activo']


class RutaSerializer(serializers.ModelSerializer):
    salidas = SalidaSerializer(many=True, read_only=True)

    class Meta:
        model = Ruta
        fields = ['id', 'nombre', 'origen', 'destino', 'duracion_estimada',
                  'descripcion', 'salidas', 'activo']


class AdminRutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = ['id', 'nombre', 'origen', 'destino', 'duracion_estimada',
                  'descripcion', 'imagen', 'activo', 'orden']


class AdminSalidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salida
        fields = ['id', 'ruta', 'dia_semana', 'hora_salida',
                  'vehiculo', 'precio_base', 'precio_promocional',
                  'promocion_activa', 'activo']
