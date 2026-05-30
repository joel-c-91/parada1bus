from rest_framework import viewsets
from .models import Servicio
from .serializers import ServicioSerializer


class ServicioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Servicio.objects.filter(activo=True)
    serializer_class = ServicioSerializer
