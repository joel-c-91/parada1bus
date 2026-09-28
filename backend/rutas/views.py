from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, date

from config.pagination import AdminPagination
from config.permissions import PublicReadOnlyOrAuthenticated
from .models import Ruta, Salida
from .serializers import (RutaSerializer, SalidaPublicSerializer,
                          AdminRutaSerializer, AdminSalidaSerializer)


class SalidaViewSet(viewsets.ReadOnlyModelViewSet):
    """Salidas reservables del sitio publico.

    Es lo que el sitio necesita para mostrar viajes con precio y
    disponibilidad real. Sin esto, la pagina de reserva no tiene de donde
    sacar el viaje que el usuario eligio.
    """

    queryset = Salida.objects.filter(activo=True, ruta__activo=True).select_related(
        'ruta', 'vehiculo'
    )
    permission_classes = [PublicReadOnlyOrAuthenticated]
    serializer_class = SalidaPublicSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        origen = self.request.query_params.get('origen', '').strip()
        destino = self.request.query_params.get('destino', '').strip()
        if origen:
            qs = qs.filter(ruta__origen__icontains=origen)
        if destino:
            qs = qs.filter(ruta__destino__icontains=destino)
        return qs


class RutaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ruta.objects.filter(activo=True)
    serializer_class = RutaSerializer
    permission_classes = [PublicReadOnlyOrAuthenticated]

    def get_queryset_salidas(self):
        return Salida.objects.filter(activo=True, ruta__activo=True).select_related(
            'ruta', 'vehiculo'
        )

    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """Devuelve viajes reservables, no rutas.

        El sitio lista horarios y precios y lleva a reservar una salida
        concreta, asi que el resultado tiene que ser una Salida.
        """
        origen = request.query_params.get('origen', '').strip()
        destino = request.query_params.get('destino', '').strip()

        if not origen or not destino:
            return Response(
                {'error': 'Debe ingresar origen y destino', 'resultados': []},
                status=status.HTTP_400_BAD_REQUEST
            )

        salidas = self.get_queryset_salidas().filter(
            ruta__origen__icontains=origen,
            ruta__destino__icontains=destino,
        )

        if not salidas:
            # Buscar inversa (origen <-> destino intercambiados)
            salidas = self.get_queryset_salidas().filter(
                ruta__origen__icontains=destino,
                ruta__destino__icontains=origen,
            )

        return Response({
            'resultados': SalidaPublicSerializer(salidas, many=True).data,
        })

    @action(detail=False, methods=['get'])
    def buscar_todo(self, request):
        """Busca viajes donde origen O destino contengan el texto."""
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'error': 'Ingrese un término de búsqueda', 'resultados': []},
                            status=status.HTTP_400_BAD_REQUEST)

        salidas = self.get_queryset_salidas().filter(
            models.Q(ruta__origen__icontains=q) | models.Q(ruta__destino__icontains=q)
        ).distinct()

        return Response({'resultados': SalidaPublicSerializer(salidas, many=True).data})


class AdminRutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.all()
    serializer_class = AdminRutaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination


class AdminSalidaViewSet(viewsets.ModelViewSet):
    queryset = Salida.objects.all()
    serializer_class = AdminSalidaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
