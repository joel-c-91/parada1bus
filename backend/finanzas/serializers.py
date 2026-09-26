from rest_framework import serializers
from .models import CategoriaGasto, Pago, Gasto, Cheque
from usuarios.models import Cliente


class CategoriaGastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaGasto
        fields = ['id', 'nombre', 'descripcion']


class PagoSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(
        source='cliente.nombre', read_only=True, default=None
    )
    metodo_pago_display = serializers.CharField(
        source='get_metodo_pago_display', read_only=True
    )

    class Meta:
        model = Pago
        fields = [
            'id', 'cliente', 'cliente_nombre', 'monto', 'fecha',
            'descripcion', 'metodo_pago', 'metodo_pago_display',
            'creado', 'actualizado',
        ]
        read_only_fields = ['creado', 'actualizado']


class GastoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(
        source='categoria.nombre', read_only=True
    )
    comprobante_url = serializers.SerializerMethodField()

    class Meta:
        model = Gasto
        fields = [
            'id', 'categoria', 'categoria_nombre', 'monto', 'fecha',
            'descripcion', 'proveedor', 'comprobante', 'comprobante_url',
            'creado', 'actualizado',
        ]
        read_only_fields = ['creado', 'actualizado']

    def get_comprobante_url(self, obj):
        if obj.comprobante:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.comprobante.url)
            return obj.comprobante.url
        return None


class ChequeSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(
        source='cliente.nombre', read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display', read_only=True
    )
    pago_info = serializers.SerializerMethodField()

    class Meta:
        model = Cheque
        fields = [
            'id', 'cliente', 'cliente_nombre', 'numero', 'banco', 'monto',
            'fecha_emision', 'fecha_vto', 'estado', 'estado_display',
            'pago', 'pago_info', 'notas', 'creado', 'actualizado',
        ]
        read_only_fields = ['creado', 'actualizado']

    def get_pago_info(self, obj):
        if obj.pago:
            return {
                'id': obj.pago.id,
                'monto': str(obj.pago.monto),
                'fecha': obj.pago.fecha,
            }
        return None
