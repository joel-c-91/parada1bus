from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Servicio
from .serializers import ServicioSerializer, AdminServicioSerializer


class ServicioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Servicio.objects.filter(activo=True)
    serializer_class = ServicioSerializer


class AdminServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = AdminServicioSerializer
    permission_classes = [IsAuthenticated]
