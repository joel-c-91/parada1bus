from rest_framework import serializers

from . import services
from .models import Reserva


class ReservaSerializer(serializers.ModelSerializer):
    salida_detalle = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = ['id', 'salida', 'salida_detalle', 'fecha_viaje', 'nombre', 'email',
                  'telefono', 'cantidad_asientos', 'codigo', 'estado', 'monto_total',
                  'pagado', 'creado']
        read_only_fields = ['id', 'codigo', 'estado', 'pagado', 'monto_total', 'creado']

    def get_salida_detalle(self, obj):
        salida = obj.salida
        return {
            'id': salida.id,
            'ruta_nombre': salida.ruta.nombre,
            'origen': salida.ruta.origen,
            'destino': salida.ruta.destino,
            'dia_semana': salida.dia_semana,
            'dia_display': salida.get_dia_semana_display(),
            'hora_salida': salida.hora_salida.strftime('%H:%M'),
            'precio': str(salida.precio_actual),
            'vehiculo_nombre': salida.vehiculo.nombre if salida.vehiculo else None,
            'capacidad': salida.capacidad,
            'asientos_disponibles': salida.asientos_disponibles,
        }

    def validate_cantidad_asientos(self, value):
        # PositiveIntegerField acepta 0. Una reserva de 0 asientos no existe.
        if value < 1:
            raise serializers.ValidationError('Debe reservar al menos 1 asiento.')
        return value

    def create(self, validated_data):
        try:
            return services.crear_reserva(**validated_data)
        except services.ErrorReserva as error:
            raise serializers.ValidationError(str(error))

    def update(self, instance, validated_data):
        try:
            return services.actualizar_reserva(instance, **validated_data)
        except services.ErrorReserva as error:
            raise serializers.ValidationError(str(error))
