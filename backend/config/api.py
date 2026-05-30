from rest_framework.routers import DefaultRouter
from flota.views import VehiculoViewSet
from servicios.views import ServicioViewSet
from charter.views import SolicitudCharterViewSet
from rutas.views import RutaViewSet
from reservas.views import ReservaViewSet
from contacto.views import MensajeContactoViewSet

router = DefaultRouter()
router.register('vehiculos', VehiculoViewSet)
router.register('servicios', ServicioViewSet)
router.register('solicitudes-charter', SolicitudCharterViewSet)
router.register('rutas', RutaViewSet)
router.register('reservas', ReservaViewSet)
router.register('contacto', MensajeContactoViewSet)

urlpatterns = router.urls
