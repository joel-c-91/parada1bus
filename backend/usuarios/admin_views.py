from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Cliente
from .serializers import ClienteSerializer


class AdminPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AdminPagination
    search_fields = ['nombre', 'email', 'telefono']
    ordering_fields = ['nombre', 'email', 'creado']
    ordering = ['-creado']
