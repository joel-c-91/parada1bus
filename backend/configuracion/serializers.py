from rest_framework import serializers

from .models import ContenidoSitio


class ImagenRelativaField(serializers.ImageField):
    """Devuelve ``/media/...`` en vez de una URL absoluta.

    Ni `ImageField` ni `FileField` de DRF sirven: los dos llaman a
    `request.build_absolute_uri()`, que arma la URL con el Host del request.
    A traves del proxy de Vite ese Host es `backend:8000`, el nombre interno de
    Docker, y el navegador no lo puede resolver: la foto que sube el admin deja
    de verse sin ningun error en ninguna parte.

    Una URL relativa se resuelve contra el origen del sitio, que es el unico
    dato que el navegador conoce con certeza.
    """

    def to_representation(self, value):
        if not value:
            return None
        return value.url


class ContenidoSitioSerializer(serializers.ModelSerializer):
    """Lo unico publico: la imagen ya resuelta a URL y su texto alternativo.

    ``orden``, ``visible`` y ``creado`` son de administracion: el sitio solo
    necesita saber que foto poner en cada seccion.
    """

    imagen = ImagenRelativaField(read_only=True)
    tiene_imagen = serializers.BooleanField(read_only=True)

    class Meta:
        model = ContenidoSitio
        fields = ['clave', 'titulo', 'imagen', 'alt_imagen', 'tiene_imagen']
        read_only_fields = fields
