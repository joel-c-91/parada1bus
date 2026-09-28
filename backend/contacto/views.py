from rest_framework import viewsets, mixins

from config.permissions import PublicCreateOrAuthenticated
from .models import MensajeContacto
from .serializers import MensajeContactoSerializer


class MensajeContactoViewSet(mixins.CreateModelMixin,
                             mixins.ListModelMixin,
                             viewsets.GenericViewSet):
    """
    Publico: solo POST (formulario de contacto del sitio).
    Requiere autenticacion: listar los mensajes recibidos.
    """

    queryset = MensajeContacto.objects.all()
    serializer_class = MensajeContactoSerializer
    permission_classes = [PublicCreateOrAuthenticated]
