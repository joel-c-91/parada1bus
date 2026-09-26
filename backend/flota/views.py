from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Vehiculo
from .serializers import VehiculoSerializer, AdminVehiculoSerializer


class AdminPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class VehiculoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vehiculo.objects.filter(activo=True)
    serializer_class = VehiculoSerializer


class AdminVehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = AdminVehiculoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
