from rest_framework import viewsets, mixins
from .models import MensajeContacto
from .serializers import MensajeContactoSerializer


class MensajeContactoViewSet(mixins.CreateModelMixin,
                             mixins.ListModelMixin,
                             viewsets.GenericViewSet):
    queryset = MensajeContacto.objects.all()
    serializer_class = MensajeContactoSerializer
