from rest_framework import serializers
from .models import Cliente


class NestedReservaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    fecha_viaje = serializers.DateField(read_only=True)
    origen = serializers.SerializerMethodField()
    destino = serializers.SerializerMethodField()
    estado = serializers.CharField(read_only=True)
    codigo = serializers.CharField(read_only=True)

    def get_origen(self, obj):
        return obj.salida.ruta.origen if hasattr(obj, 'salida') else None

    def get_destino(self, obj):
        return obj.salida.ruta.destino if hasattr(obj, 'salida') else None


class NestedCharterSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    origen = serializers.CharField(read_only=True)
    destino = serializers.CharField(read_only=True)
    fecha_viaje = serializers.DateField(read_only=True)
    estado = serializers.CharField(read_only=True)


class ClienteSerializer(serializers.ModelSerializer):
    reserva_set = serializers.SerializerMethodField()
    solicitudcharter_set = serializers.SerializerMethodField()

    class Meta:
        model = Cliente
        fields = [
            'id', 'nombre', 'email', 'telefono', 'direccion', 'notas',
            'creado', 'actualizado',
            'reserva_set', 'solicitudcharter_set',
        ]
        read_only_fields = ['creado', 'actualizado']

    def get_reserva_set(self, obj):
        reservas = obj.reserva_set.all().select_related('salida__ruta')
        return NestedReservaSerializer(reservas, many=True).data

    def get_solicitudcharter_set(self, obj):
        charters = obj.solicitudcharter_set.all()
        return NestedCharterSerializer(charters, many=True).data
