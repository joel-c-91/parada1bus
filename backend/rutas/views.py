from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from datetime import datetime, date
from .models import Ruta, Salida
from .serializers import RutaSerializer, AdminRutaSerializer, AdminSalidaSerializer


class AdminPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class RutaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ruta.objects.filter(activo=True)
    serializer_class = RutaSerializer

    @action(detail=False, methods=['get'])
    def buscar(self, request):
        origen = request.query_params.get('origen', '').strip().lower()
        destino = request.query_params.get('destino', '').strip().lower()
        fecha_str = request.query_params.get('fecha', '')

        if not origen or not destino:
            return Response(
                {'error': 'Debe ingresar origen y destino'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rutas = self.get_queryset().filter(
            origen__icontains=origen,
            destino__icontains=destino,
        )

        if not rutas:
            # Buscar inversa (origen <-> destino intercambiados)
            rutas = self.get_queryset().filter(
                origen__icontains=destino,
                destino__icontains=origen,
            )

        if not rutas:
            return Response({'resultados': [], 'mensaje': 'No se encontraron rutas para esa búsqueda'})

        serializer = self.get_serializer(rutas, many=True)
        return Response({'resultados': serializer.data})

    @action(detail=False, methods=['get'])
    def buscar_todo(self, request):
        """Busca rutas donde origen O destino contengan el texto"""
        q = request.query_params.get('q', '').strip().lower()
        if not q:
            return Response({'error': 'Ingrese un término de búsqueda'}, status=400)
        rutas = self.get_queryset().filter(
            origen__icontains=q
        ) | self.get_queryset().filter(
            destino__icontains=q
        )
        rutas = rutas.distinct()
        serializer = self.get_serializer(rutas, many=True)
        return Response(serializer.data)


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
