from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters

from config.pagination import AdminPagination
from .models import CategoriaGasto, Pago, Gasto, Cheque
from .serializers import (
    CategoriaGastoSerializer,
    PagoSerializer,
    GastoSerializer,
    ChequeSerializer,
)


class CategoriaGastoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaGasto.objects.all()
    serializer_class = CategoriaGastoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
    ordering_fields = ['nombre']
    ordering = ['nombre']


class PagoFilter(filters.FilterSet):
    fecha_desde = filters.DateFilter(field_name='fecha', lookup_expr='gte')
    fecha_hasta = filters.DateFilter(field_name='fecha', lookup_expr='lte')
    metodo_pago = filters.CharFilter(field_name='metodo_pago')

    class Meta:
        model = Pago
        fields = ['fecha_desde', 'fecha_hasta', 'metodo_pago', 'cliente']


class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.all().select_related('cliente')
    serializer_class = PagoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
    filterset_class = PagoFilter
    ordering_fields = ['fecha', 'monto', 'cliente', 'metodo_pago', 'creado']
    ordering = ['-fecha', '-creado']


class GastoFilter(filters.FilterSet):
    fecha_desde = filters.DateFilter(field_name='fecha', lookup_expr='gte')
    fecha_hasta = filters.DateFilter(field_name='fecha', lookup_expr='lte')

    class Meta:
        model = Gasto
        fields = ['fecha_desde', 'fecha_hasta', 'categoria', 'proveedor']


class GastoViewSet(viewsets.ModelViewSet):
    queryset = Gasto.objects.all().select_related('categoria')
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
    filterset_class = GastoFilter
    ordering_fields = ['fecha', 'monto', 'categoria', 'proveedor', 'creado']
    ordering = ['-fecha', '-creado']


class ChequeFilter(filters.FilterSet):
    fecha_emision_desde = filters.DateFilter(
        field_name='fecha_emision', lookup_expr='gte'
    )
    fecha_emision_hasta = filters.DateFilter(
        field_name='fecha_emision', lookup_expr='lte'
    )

    class Meta:
        model = Cheque
        fields = ['fecha_emision_desde', 'fecha_emision_hasta', 'estado', 'cliente']


class ChequeViewSet(viewsets.ModelViewSet):
    queryset = Cheque.objects.all().select_related('cliente', 'pago')
    serializer_class = ChequeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
    filterset_class = ChequeFilter
    filter_backends = [
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]
    search_fields = ['numero', 'cliente__nombre']
    ordering_fields = [
        'fecha_emision', 'fecha_vto', 'monto', 'numero',
        'banco', 'estado', 'creado'
    ]
    ordering = ['-fecha_emision', '-creado']

    def perform_update(self, serializer):
        """Call model.clean() to validate state transitions."""
        instance = self.get_object()
        new_estado = serializer.validated_data.get('estado', instance.estado)
        if new_estado != instance.estado:
            instance.estado = new_estado
            from django.core.exceptions import ValidationError
            try:
                instance.clean()
            except ValidationError as e:
                from rest_framework.exceptions import ValidationError as DRFValidationError
                raise DRFValidationError(e.message_dict)
        serializer.save()
