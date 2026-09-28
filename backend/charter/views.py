from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from config.permissions import PublicCreateOrAuthenticated
from .models import SolicitudCharter
from .serializers import SolicitudCharterSerializer


class SolicitudCharterViewSet(viewsets.ModelViewSet):
    """
    Publico: solo POST (formulario de cotizacion del sitio).
    Requiere autenticacion: listar, ver, cotizar, modificar y eliminar solicitudes.
    """

    queryset = SolicitudCharter.objects.all()
    serializer_class = SolicitudCharterSerializer
    permission_classes = [PublicCreateOrAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    @action(detail=True, methods=['post'])
    def cotizar(self, request, pk=None):
        solicitud = self.get_object()
        precio = request.data.get('precio')
        if not precio:
            return Response({'error': 'Debe ingresar un precio'}, status=status.HTTP_400_BAD_REQUEST)
        solicitud.precio_cotizado = precio
        solicitud.estado = 'cotizado'
        solicitud.save()
        return Response({'mensaje': 'Precio asignado correctamente'})
