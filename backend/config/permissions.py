from rest_framework.permissions import SAFE_METHODS, BasePermission


class PublicReadOnlyOrAuthenticated(BasePermission):
    """Anonimo: solo lectura (GET/HEAD/OPTIONS). Autenticado: todo.

    Pensado para catalogos publicos del sitio (vehiculos, servicios, rutas).
    Como el viewset es ReadOnly, ningun metodo de escritura queda expuesto
    aunque se agreguen acciones: cualquier POST/DELETE cae en IsAuthenticated.
    """

    message = 'Necesitas iniciar sesion para acceder a este recurso.'

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return True
        return request.method in SAFE_METHODS


class PublicCreateOrAuthenticated(BasePermission):
    """Anonimo: unicamente la accion ``create`` (formularios del sitio).

    Pensado para endpoints que reciben pedidos del publico (reservas,
    contacto, cotizacion de charter) y nada mas.

    Filtra por ACCION de DRF, no por metodo HTTP: asi una accion interna que
    tambien sea POST (por ejemplo ``cotizar``) queda protegida siempre.
    Es la diferencia entre "acepta pedidos" y "acepta comandos".
    """

    message = 'Necesitas iniciar sesion para acceder a este recurso.'

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return True
        return getattr(view, 'action', None) == 'create'
