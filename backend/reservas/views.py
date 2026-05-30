from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Reserva
from .serializers import ReservaSerializer
import secrets
import string


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer

    def perform_create(self, serializer):
        codigo = self._generar_codigo()
        serializer.save(codigo=codigo)

    def _generar_codigo(self):
        chars = string.ascii_uppercase + string.digits
        while True:
            codigo = 'P1B-' + ''.join(secrets.choice(chars) for _ in range(6))
            if not Reserva.objects.filter(codigo=codigo).exists():
                return codigo
