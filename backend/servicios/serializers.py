from rest_framework import serializers
from .models import Servicio


class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion_corta', 'descripcion_larga',
                  'icono', 'imagen', 'orden']


class AdminServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion_corta', 'descripcion_larga',
                  'icono', 'imagen', 'activo', 'orden']
