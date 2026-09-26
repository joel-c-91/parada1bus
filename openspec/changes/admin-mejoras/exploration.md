## Exploration: Admin Mejoras (Imágenes, Clientes, Finanzas)

### Current State

#### Architecture Overview
- **Backend**: Django 5.2 + DRF 3.16 + SQLite (dev). 10 apps: `flota`, `servicios`, `charter`, `rutas`, `reservas`, `contacto`, `usuarios`, `finanzas`, `promociones`, `configuracion`.
- **Frontend**: React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + React Router v7 + React Query 5.
- **Auth**: simplejwt with access/refresh tokens. Admin API at `/api/admin/*` requires `IsAuthenticated`.

#### Existing Admin Panel (PR #1 of `admin-panel` change)
Already has working CRUD for: Flota, Servicios, Rutas, Salidas. Layout: collapsible sidebar + bottom nav. Reusable components: DataTable, FormModal, ConfirmDialog, EmptyState. All forms use react-hook-form + Zod. Images are partially wired in forms but NOT displayed on public pages.

#### Image Upload Status
✅ **Backend models already support images**:
  - `Vehiculo.imagen = ImageField(upload_to='vehiculos/')`
  - `Servicio.imagen = ImageField(upload_to='servicios/')`
  - `Ruta.imagen = ImageField(upload_to='rutas/')`
  
✅ **Settings already configured**:
  - `MEDIA_URL = 'media/'` and `MEDIA_ROOT = BASE_DIR / 'media'` in `settings.py`
  - `urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)` in DEBUG mode
  - `Pillow==11.1.0` already in `requirements.txt`

✅ **Admin forms already have image upload UI**:
  - FleetForm, ServiceForm, RouteForm all have `<input type="file">` with preview
  - They send `FormData` when a file is selected, JSON otherwise
  - They display existing server images as preview in edit mode

❌ **Public pages don't use images**:
  - `Flota.tsx` shows `"Foto próximamente"` placeholder (Users icon)
  - `Servicios.tsx` doesn't display images at all
  - Both receive the `imagen` field in API responses but ignore it

❌ **RouteForm image upload wired but RouteForm is never invoked with image**: The admin backend serializers all include `imagen` in their fields.

#### Client Management Status
❌ **No Cliente model exists** — `usuarios/models.py` is empty
❌ **Reserva has inline name/email/telefono** — no FK to a Cliente model
❌ **SolicitudCharter has inline name/email/telefono** — same pattern
✅ **BottomNav already shows "Usuarios" as disabled placeholder** (Próximamente)
✅ **Existing admin-panel proposal already describes the Cliente model extraction**

#### Financial System Status
❌ **No financial models exist** — `finanzas/models.py` is empty, `finanzas/views.py` is empty
❌ **No endpoints** — `finanzas/` has no admin API or serializers yet
✅ **BottomNav already shows "Finanzas" as disabled placeholder** (Próximamente)
✅ **`finanzas` app is registered in INSTALLED_APPS** (but empty)
✅ **Existing admin-panel proposal describes Pago, Gasto, Cheque, FlujoCaja**

### Affected Areas

#### Backend
- `backend/finanzas/models.py` — New models: Pago, Gasto, Cheque, FlujoCaja, CategoriaGasto
- `backend/finanzas/serializers.py` — New serializers for financial models
- `backend/finanzas/views.py` — New ModelViewSets
- `backend/finanzas/admin.py` — Django admin registration
- `backend/finanzas/tests.py` — Tests
- `backend/usuarios/models.py` — New Cliente model
- `backend/usuarios/serializers.py` — New ClienteSerializer
- `backend/usuarios/views.py` — New ClienteViewSet
- `backend/usuarios/admin.py` — Django admin registration
- `backend/reservas/models.py` — Add FK to Cliente (nullable), keep inline fields as fallback
- `backend/charter/models.py` — Add FK to Cliente (nullable), keep inline fields as fallback
- `backend/config/admin_api.py` — Register new admin viewsets
- `backend/config/urls.py` — Possibly no changes needed (admin_api handles it)
- `backend/flota/serializers.py` — Already includes `imagen`, no change needed
- `backend/servicios/serializers.py` — Already includes `imagen`, no change needed
- `backend/rutas/serializers.py` — Already includes `imagen`, no change needed

#### Frontend
- `frontend/src/pages/Flota.tsx` — Display vehicle images
- `frontend/src/pages/Servicios.tsx` — Display service images
- `frontend/src/pages/admin/` — New pages: ClientsPage, FinanzasPage (DashboardPage already exists)
- `frontend/src/components/admin/forms/` — New forms: ClientForm, financial forms
- `frontend/src/components/admin/Sidebar.tsx` — Add nav items for Clientes and Finanzas
- `frontend/src/components/admin/BottomNav.tsx` — Enable placeholder items
- `frontend/src/App.tsx` — Add new admin routes

### Approaches for Each Feature

**1. Image Upload** — already 80% done, just needs public display

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| A. Display images on public pages only | Zero backend changes, minimal frontend work | Images already upload but nobody sees them | Low |
| B. Add image gallery (multiple images per vehicle) | Richer UI | Requires new model, migration, more complex form | High |
| C. Add image cropping/resizing on upload | Better performance | Extra dependency, more complexity | Medium |

**Recommendation**: **Approach A** — the backend model, serializers, admin forms, and media serving are all already in place. Only the public Flota.tsx and Servicios.tsx pages need to display the `imagen` field. For vehicles: replace the placeholder div with an `<img>` tag. For services: add an image alongside the text. Additionally, consider serving optimized thumbnails via Django's `ImageField` and using `{% thumbnail %}` or a simple `max_size` view helper if images are too large. This is the lowest effort with highest visibility impact.

**2. Client Management**

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| A. Extract Cliente model + FK from Reserva/Charter | Clean design, single source of truth | Migration complexity, legacy data has NULL FK | Medium |
| B. Keep inline fields, add Cliente as optional enrichment | No migration risk, backward compatible | Data duplication, harder to get unified view | Low |
| C. Full CRM: Cliente model + travel history + notes | Complete solution | More code, adds scope | High |

**Recommendation**: **Approach A** — Create a `Cliente` model (nombre, email, telefono, direccion, notas, creado) in `usuarios/`. Add a nullable FK to `Reserva` and `SolicitudCharter`. Keep existing inline fields as denormalized fallback (so old records still work). Create a `ClienteAdminViewSet` with search by name/email/phone. Add a "travel history" tab that queries Reserva + Charter by Cliente FK. This matches the existing proposal and unlocks the financial system's need to track client payments.

**3. Financial System**

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| A. Simple income/expense tracking (Pago + Gasto models) | Covers 80% of needs, fast to build | No cash flow projection, no check management | Medium |
| B. Full system: Pago, Gasto, Cheque, FlujoCaja, Categorias | Complete financial picture, matches proposal | More complex, more forms, needs CSV export | High |
| C. Use existing Django admin for financial CRUD only | Zero frontend work | Owner has to use Django admin (bad mobile UX) | Low |

**Recommendation**: **Approach B** — Build the full system as described in the existing proposal, but phase it:
- **Phase 1**: Income/Expense (Pago, Gasto with categorías) + simple ledger view
- **Phase 2**: Cheques (Cheque model with depositar/rechazar workflow)
- **Phase 3**: Cash flow report (FlujoCaja as a computed view, not a stored model)

This matches the owner's needs (replace paper-based tracking) without over-engineering. Use `DecimalField` for all monetary values (no floats). Each model gets a `creado` timestamp and an admin ViewSet with date-range filtering.

### Models needed (new or modified)

#### New models in `usuarios/`:
```python
class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    telefono = models.CharField(max_length=50, blank=True)
    direccion = models.TextField(blank=True)
    notas = models.TextField(blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
```

#### Modified `reservas/models.py`:
- Add `cliente = models.ForeignKey(Cliente, null=True, blank=True, on_delete=SET_NULL)`

#### Modified `charter/models.py`:
- Add `cliente = models.ForeignKey(Cliente, null=True, blank=True, on_delete=SET_NULL)`

#### New models in `finanzas/`:
```python
class CategoriaGasto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

class Pago(models.Model):  # Ingreso
    METODOS = [('efectivo', 'Efectivo'), ('transferencia', 'Transferencia'),
               ('cheque', 'Cheque'), ('otro', 'Otro')]
    cliente = models.ForeignKey(Cliente, null=True, blank=True, on_delete=SET_NULL)
    reserva = models.ForeignKey(Reserva, null=True, blank=True, on_delete=SET_NULL)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo = models.CharField(max_length=20, choices=METODOS)
    concepto = models.CharField(max_length=200)
    fecha = models.DateField()
    creado = models.DateTimeField(auto_now_add=True)

class Gasto(models.Model):
    categoria = models.ForeignKey(CategoriaGasto, on_delete=PROTECT)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField()
    fecha = models.DateField()
    comprobante = models.FileField(upload_to='gastos/', blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)

class Cheque(models.Model):
    ESTADOS = [('recibido', 'Recibido'), ('depositado', 'Depositado'),
               ('rechazado', 'Rechazado'), ('entregado', 'Entregado')]
    cliente = models.ForeignKey(Cliente, null=True, blank=True, on_delete=SET_NULL)
    numero = models.CharField(max_length=50)
    banco = models.CharField(max_length=100)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_emision = models.DateField()
    fecha_cobro = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='recibido')
    creado = models.DateTimeField(auto_now_add=True)
```

### Risks

1. **Financial data integrity** — decimal precision, accounting errors. Mitigation: `DecimalField` everywhere, no floats. Manual audit CSV export. Owner reconciles against paper records.

2. **Cliente migration data loss** — existing Reservas and Charters have inline name/email/telefono but no FK to Cliente. Mitigation: FK is nullable. Create a SQL/view-based "virtual client" from inline fields for travel history. Keep inline fields as fallback on the model.

3. **Scope creep** — financial system is the biggest risk (owner may want AR/AP, VAT, reconciliation). Mitigation: define MVP boundaries clearly. Phase 1 = income/expense + daily cash. No VAT, no balance sheet, no P&L. If owner demands more, defer to a future change.

4. **Image serving in production** — dev serves media via Django's `static()`. Production (Railway/Render) needs a proper media-serving strategy (S3, whitelabel CDN, or nginx). Mitigation: document this as a separate infra task. Images work in dev regardless.

5. **Mobile UX for financial forms** — entering monetary amounts and dates on mobile is friction. Mitigation: use native `<input type="date">` and `<input type="number" inputMode="decimal">`. Test on actual Android phone.

### Ready for Proposal
Yes — the exploration confirms all three features are well-understood. The image feature is 80% done (backend + admin forms work, only public display missing). Client management has a clear path (Cliente model + FK migration) already sketched in the existing proposal. The financial system needs models and CRUD from scratch but has clear domain boundaries. Recommend proposing all three as separate phases within a single `admin-mejoras` change, starting with images (quick win), then clients, then finances.
