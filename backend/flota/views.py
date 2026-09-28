from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from config.pagination import AdminPagination
from config.permissions import PublicReadOnlyOrAuthenticated
from .models import Vehiculo
from .serializers import VehiculoSerializer, AdminVehiculoSerializer


class VehiculoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vehiculo.objects.filter(activo=True)
    serializer_class = VehiculoSerializer
    permission_classes = [PublicReadOnlyOrAuthenticated]


class AdminVehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = AdminVehiculoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
