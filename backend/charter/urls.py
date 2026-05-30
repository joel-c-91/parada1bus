from rest_framework.routers import DefaultRouter
from .views import SolicitudCharterViewSet

router = DefaultRouter()
router.register('solicitudes', SolicitudCharterViewSet, basename='solicitud')
urlpatterns = router.urls
