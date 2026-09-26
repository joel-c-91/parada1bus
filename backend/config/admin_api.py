from rest_framework.routers import DefaultRouter

from flota.views import AdminVehiculoViewSet
from servicios.views import AdminServicioViewSet
from rutas.views import AdminRutaViewSet, AdminSalidaViewSet
from usuarios.admin_views import ClienteViewSet
from finanzas.admin_views import (
    CategoriaGastoViewSet,
    PagoViewSet,
    GastoViewSet,
    ChequeViewSet,
)

admin_router = DefaultRouter()
admin_router.register('vehiculos', AdminVehiculoViewSet, basename='admin-vehiculos')
admin_router.register('servicios', AdminServicioViewSet, basename='admin-servicios')
admin_router.register('rutas', AdminRutaViewSet, basename='admin-rutas')
admin_router.register('salidas', AdminSalidaViewSet, basename='admin-salidas')
admin_router.register('clientes', ClienteViewSet, basename='admin-clientes')
admin_router.register('pagos', PagoViewSet, basename='admin-pagos')
admin_router.register('gastos', GastoViewSet, basename='admin-gastos')
admin_router.register('categorias-gasto', CategoriaGastoViewSet, basename='admin-categorias-gasto')
admin_router.register('cheques', ChequeViewSet, basename='admin-cheques')
