"""Configuracion compartida por los endpoints del panel de administracion.

Vive en `config/` y no en cada app porque la clase de paginacion la usan varios
ViewSets. Tenerla duplicada en `flota`, `rutas` y `servicios` hacia que cambiar
el tamano de pagina en un solo lugar sea un error facil de cometer.
"""

from rest_framework.pagination import PageNumberPagination


class AdminPagination(PageNumberPagination):
    """Paginacion por numero de pagina para los listados del panel.

    25 filas por pagina es un punto medio razonable para tablas de escritorio.
    El cliente puede pedir hasta 100 con ?page_size=100, y mas alla el servidor
    lo recorta a 100 para no permitir que alguien pida la tabla entera.
    """

    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100
