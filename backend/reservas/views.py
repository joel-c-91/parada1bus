from rest_framework import viewsets, status
from rest_framework.response import Response

from config.permissions import PublicCreateOrAuthenticated
from .models import Reserva
from .serializers import ReservaSerializer


class ReservaViewSet(viewsets.ModelViewSet):
    """
    Publico: solo POST (formulario de reserva del sitio).
    Requiere autenticacion: listar, ver, modificar, cancelar y eliminar reservas.

    La generacion del codigo y el control de capacidad viven en
    reservas/services.py, no aqui: la regla no depende de quien llame.
    """

    queryset = Reserva.objects.select_related('salida', 'salida__ruta', 'salida__vehiculo')
    serializer_class = ReservaSerializer
    permission_classes = [PublicCreateOrAuthenticated]
