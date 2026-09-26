# Design: Admin Mejoras

## Technical Approach

Four stacked (stacked-to-main) PRs extending the existing admin panel with image display, client management, and financial tracking. Follows existing patterns: DRF ModelViewSet + IsAuthenticated for admin CRUD, React Query + DataTable/FormModal for frontend, react-hook-form + Zod for validation.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Admin views location | `admin_views.py` vs inline in `views.py` | Existing flota/servicios inline both public+admin. New file is explicit but breaks pattern | `admin_views.py` — cleaner separation for new apps, importable alone |
| Cliente FK on Reserva/Charter | Nullable FK vs data migration to backfill | Backfill requires matching logic (name+email). Risk of mismatches. | Nullable FK, keep inline fields as denormalized fallback. Owner links clients manually |
| CategoriaGasto ViewSet | read-only vs full CRUD | Read-only enforces data integrity; but owner may need to add categories | Read-only list (no edit/delete), with create endpoint |
| Cheque estado transitions | Free-text CharField vs explicit state machine | State machine prevents invalid transitions; adds complexity for 4 states | CharField with choices + frontend validation. Model-level `clean()` guards transitions |
| Cheque vs Pago relationship | Optional FK Cheque→Pago vs separate | Linking allows reconciling cheques against payments. Not required for MVP | Nullable FK Cheque→Pago, added in PR #4 |

## Data Flow

```
PR #1: Flota/Servicios.tsx → GET /api/vehiculos/ (includes imagen URL) → <img> or placeholder SVG

PR #2: ClientesPage → GET/POST/PATCH/DELETE /admin/clientes/ → ClienteViewSet → Cliente model
         Detail view: GET /admin/clientes/:id/ → nested reserva_set, solicitudcharter_set

PR #3: PagosPage/GastosPage → GET/POST/PATCH/DELETE /admin/pagos/, /admin/gastos/ → ViewSets → finanzas models
         CategoriasPage → GET /admin/categorias-gasto/ (read-only list)

PR #4: ChequesPage → GET/POST/PATCH /admin/cheques/ → ChequeViewSet (status filter) → Cheque model
```

## PR #1 — Image Display

**Files:** `frontend/src/pages/Flota.tsx`, `frontend/src/pages/Servicios.tsx`

Add `imagen: string | null` to both interfaces. Replace placeholder div with conditional render:

```tsx
{/* imagen exists */}
<img src={v.imagen} alt={v.nombre} className="w-full h-full object-cover" />
{/* null */}
<Bus className="w-12 h-12 text-gray-300" />
<span className="text-xs text-gray-400 mt-1">Sin imagen</span>
```

Flota already has `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Image area is already `h-40 md:h-48`. No new components needed.

## PR #2 — Client Management

### Models

```python
# usuarios/models.py
class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    telefono = models.CharField(max_length=50)
    direccion = models.TextField(blank=True)
    notas = models.TextField(blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

# reservas/models.py — add field
cliente = models.ForeignKey('usuarios.Cliente', null=True, blank=True, on_delete=models.SET_NULL)

# charter/models.py — add field
cliente = models.ForeignKey('usuarios.Cliente', null=True, blank=True, on_delete=models.SET_NULL)
```

### Serializer

`ClienteSerializer` with `reserva_set` and `solicitudcharter_set` as nested read-only `SerializerMethodField` using existing ReservaSerializer/CharterSerializer.

### ViewSet

`ClienteViewSet(ModelViewSet)` with `search_fields=['nombre', 'email', 'telefono']`, `ordering_fields`, pagination.

### Frontend

`ClientesPage.tsx` — same DataTable + FormModal + ConfirmDialog pattern as FleetPage/ServicesPage. `ClientForm` with nombre, email, telefono, direccion, notas fields. Detail view in a separate modal tab showing linked Reservas/Charters.

### Registration

Add to `config/admin_api.py`:
```python
from usuarios.views import ClienteViewSet
admin_router.register('clientes', ClienteViewSet, basename='admin-clientes')
```

## PR #3 — Income/Expense

### Models

```python
# finanzas/models.py
class CategoriaGasto(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

class Pago(models.Model):
    cliente = models.ForeignKey('usuarios.Cliente', null=True, blank=True, on_delete=models.SET_NULL)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()
    descripcion = models.TextField(blank=True)
    metodo_pago = models.CharField(max_length=50)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

class Gasto(models.Model):
    categoria = models.ForeignKey(CategoriaGasto, on_delete=models.PROTECT)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()
    descripcion = models.TextField(blank=True)
    proveedor = models.CharField(max_length=100, blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
```

### ViewSets

`CategoriaGastoViewSet(ReadOnlyModelViewSet)` for list only. `PagoViewSet(ModelViewSet)` and `GastoViewSet(ModelViewSet)`.

### Frontend

`PagosPage.tsx`, `GastosPage.tsx`, `CategoriasGastoPage.tsx` — each follows DataTable pattern. Pagos/Gastos forms have monto (number input), fecha (date picker), descripcion, metodo_pago/categoria select.

## PR #4 — Cheques

### Model (add to finanzas/models.py)

```python
ESTADOS_CHEQUE = [
    ('recibido', 'Recibido'),
    ('depositado', 'Depositado'),
    ('rechazado', 'Rechazado'),
    ('entregado', 'Entregado'),
]

class Cheque(models.Model):
    numero = models.CharField(max_length=50)
    banco = models.CharField(max_length=100)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADOS_CHEQUE, default='recibido')
    fecha_emision = models.DateField()
    fecha_cobro = models.DateField(null=True, blank=True)
    cliente = models.ForeignKey('usuarios.Cliente', null=True, blank=True, on_delete=models.SET_NULL)
    pago = models.ForeignKey('finanzas.Pago', null=True, blank=True, on_delete=models.SET_NULL)
    notas = models.TextField(blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
```

### ViewSet

`ChequeViewSet(ModelViewSet)` with `filterset_fields=['estado']` for status filtering. Override `perform_update` to enforce valid transitions.

### Frontend

`ChequesPage.tsx` — DataTable with estado badge (color-coded) + action buttons for status transitions (Recibido→Depositado, Recibido→Rechazado, Recibido→Entregado).

## File Changes Summary

| File | Action |
|------|--------|
| `frontend/src/pages/Flota.tsx` | Modify — add imagen to interface + conditional render |
| `frontend/src/pages/Servicios.tsx` | Modify — add imagen to interface + conditional render |
| `backend/usuarios/models.py` | Modify — add Cliente model |
| `backend/usuarios/serializers.py` | Create — ClienteSerializer |
| `backend/usuarios/admin_views.py` | Create — ClienteViewSet |
| `backend/usuarios/migrations/` | Create — Cliente migration |
| `backend/reservas/models.py` | Modify — add cliente FK |
| `backend/charter/models.py` | Modify — add cliente FK |
| `backend/finanzas/models.py` | Modify — add CategoriaGasto, Pago, Gasto, Cheque |
| `backend/finanzas/serializers.py` | Create — all finanzas serializers |
| `backend/finanzas/admin_views.py` | Create — all finanzas ViewSets |
| `backend/finanzas/migrations/` | Create — 2 migrations (PR #3, PR #4) |
| `backend/config/admin_api.py` | Modify — register new routers |
| `frontend/src/App.tsx` | Modify — add admin routes |
| `frontend/src/components/admin/Sidebar.tsx` | Modify — add nav links |
| `frontend/src/components/admin/BottomNav.tsx` | Modify — enable Clientes/Finanzas |
| `frontend/src/pages/admin/ClientesPage.tsx` | Create |
| `frontend/src/components/admin/forms/ClientForm.tsx` | Create |
| `frontend/src/pages/admin/PagosPage.tsx` | Create |
| `frontend/src/pages/admin/GastosPage.tsx` | Create |
| `frontend/src/pages/admin/CategoriasGastoPage.tsx` | Create |
| `frontend/src/pages/admin/ChequesPage.tsx` | Create |

## Testing Strategy

No test runner exists. Manual verification: `python manage.py makemigrations && python manage.py migrate`, `cd frontend && npx tsc -b` for type safety.

## Migration / Rollout

- PR #1: No migration. Rollback = revert Flota.tsx + Servicios.tsx
- PR #2: Create migration for Cliente + nullable FKs. Rollback = revert migration + revert files
- PR #3: Create migration for finanzas models. Rollback = revert migration + revert files. Depends on PR #2
- PR #4: Create migration for Cheque. Rollback = revert. Depends on PR #3

Stacked to main in order: #1 → #2 → #3 → #4.

## Open Questions

- [ ] Does `Pago.cliente` FK need to be created in PR #3 even if PR #2 (Clientes) hasn't merged yet? Yes — PR #3 depends on PR #2.
- [ ] Should Cheque.pago FK reference Pago from start or be deferred to a future PR? Include now — it's a nullable FK, zero cost.
