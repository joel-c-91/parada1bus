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


class SalidaPublicSerializer(serializers.ModelSerializer):
    """Salida tal como la necesita el sitio para mostrar y reservar.

    Aplana la ruta y el vehiculo, resuelve el precio vigente y expone la
    disponibilidad real. Si ``asientos_disponibles`` es null, la salida no
    tiene capacidad declarada y el sitio no debe prometer un lugar.
    """

    ruta_nombre = serializers.CharField(source='ruta.nombre', read_only=True)
    origen = serializers.CharField(source='ruta.origen', read_only=True)
    destino = serializers.CharField(source='ruta.destino', read_only=True)
    dia_display = serializers.CharField(source='get_dia_semana_display', read_only=True)
    hora_salida = serializers.SerializerMethodField()
    precio = serializers.SerializerMethodField()
    vehiculo_nombre = serializers.SerializerMethodField()
    capacidad = serializers.IntegerField(read_only=True)
    asientos_disponibles = serializers.SerializerMethodField()

    class Meta:
        model = Salida
        fields = ['id', 'ruta_nombre', 'origen', 'destino', 'dia_semana', 'dia_display',
                  'hora_salida', 'precio', 'vehiculo_nombre', 'capacidad',
                  'asientos_disponibles']

    def get_hora_salida(self, obj):
        return obj.hora_salida.strftime('%H:%M')

    def get_precio(self, obj):
        return str(obj.precio_actual)

    def get_vehiculo_nombre(self, obj):
        return obj.vehiculo.nombre if obj.vehiculo else None

    def get_asientos_disponibles(self, obj):
        return obj.asientos_disponibles


class RutaSerializer(serializers.ModelSerializer):
    salidas = SalidaSerializer(many=True, read_only=True)

    class Meta:
        model = Ruta
        fields = ['id', 'nombre', 'origen', 'destino', 'duracion_estimada',
                  'descripcion', 'imagen', 'salidas', 'activo']


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
