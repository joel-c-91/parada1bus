from rest_framework.routers import DefaultRouter

from flota.views import AdminVehiculoViewSet
from servicios.views import AdminServicioViewSet
from rutas.views import AdminRutaViewSet, AdminSalidaViewSet

admin_router = DefaultRouter()
admin_router.register('vehiculos', AdminVehiculoViewSet, basename='admin-vehiculos')
admin_router.register('servicios', AdminServicioViewSet, basename='admin-servicios')
admin_router.register('rutas', AdminRutaViewSet, basename='admin-rutas')
admin_router.register('salidas', AdminSalidaViewSet, basename='admin-salidas')
