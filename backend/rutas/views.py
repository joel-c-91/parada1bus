from rest_framework import viewsets
from .models import Ruta
from .serializers import RutaSerializer


class RutaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ruta.objects.filter(activo=True)
    serializer_class = RutaSerializer
