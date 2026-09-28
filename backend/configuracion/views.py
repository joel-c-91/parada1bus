from rest_framework import viewsets

from config.permissions import PublicReadOnlyOrAuthenticated
from .models import ContenidoSitio
from .serializers import ContenidoSitioSerializer


class ContenidoSitioViewSet(viewsets.ReadOnlyModelViewSet):
    """Fotos de las secciones del sitio: lectura publica, escritura solo admin.

    Solo se exponen los espacios con imagen y visibles. Si una seccion todavia
    no tiene foto, el sitio usa su diseno por defecto en vez de romper.
    """

    permission_classes = [PublicReadOnlyOrAuthenticated]
    serializer_class = ContenidoSitioSerializer
    lookup_field = 'clave'
    # El router necesita el atributo en la clase para deducir el basename.
    # get_queryset() por defecto de DRF ya devuelve esto.
    queryset = ContenidoSitio.objects.filter(visible=True).exclude(imagen='')
