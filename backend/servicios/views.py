from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Servicio
from .serializers import ServicioSerializer, AdminServicioSerializer


class AdminPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class ServicioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Servicio.objects.filter(activo=True)
    serializer_class = ServicioSerializer


class AdminServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = AdminServicioSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
