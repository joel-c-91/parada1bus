from rest_framework.routers import DefaultRouter
from configuracion.views import ContenidoSitioViewSet
from flota.views import VehiculoViewSet
from servicios.views import ServicioViewSet
from charter.views import SolicitudCharterViewSet
from rutas.views import RutaViewSet, SalidaViewSet
from reservas.views import ReservaViewSet
from contacto.views import MensajeContactoViewSet

router = DefaultRouter()
router.register('contenido-sitio', ContenidoSitioViewSet)
router.register('vehiculos', VehiculoViewSet)
router.register('servicios', ServicioViewSet)
router.register('solicitudes-charter', SolicitudCharterViewSet)
router.register('rutas', RutaViewSet)
router.register('salidas', SalidaViewSet)
router.register('reservas', ReservaViewSet)
router.register('contacto', MensajeContactoViewSet)

urlpatterns = router.urls
