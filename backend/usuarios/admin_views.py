from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from config.pagination import AdminPagination
from .models import Cliente
from .serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
    search_fields = ['nombre', 'email', 'telefono']
    ordering_fields = ['nombre', 'email', 'creado']
    ordering = ['-creado']
