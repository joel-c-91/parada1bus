# Proposal: Admin Mejoras

## Intent

Extend the existing admin panel with three features the owner needs to run daily operations: display uploaded vehicle/service images on public pages, extract client data from inline reservation fields into a dedicated model, and replace paper-based financial tracking with digital income/expense/cheque records.

## Scope

### In Scope
- Display `imagen` on Flota.tsx and Servicios.tsx public pages
- Cliente model (nombre, email, telefono, direccion, notas, timestamps) + nullable FK on Reserva, SolicitudCharter
- Admin CRUD for Clientes with search + travel history view
- CategoriaGasto, Pago (ingreso), Gasto (egreso) models + admin CRUD
- Cheque model (recibido/depositado/rechazado/entregado) + admin CRUD
- Enable sidebar/bottom-nav items for Clientes and Finanzas

### Out of Scope
- Financial dashboard, charts, or reports
- Payment gateway integration
- Client self-service portal
- Multi-image vehicle galleries

## Capabilities

### New Capabilities
- `image-display`: Display uploaded vehicle/service images on public pages
- `client-management`: Cliente model, FK migration from Reserva/Charter, admin CRUD, travel history
- `financial-records`: CategoriaGasto, Pago, Gasto models + admin CRUD
- `cheque-management`: Cheque model with estado workflow + admin CRUD

### Modified Capabilities
None — `openspec/specs/` is empty.

## Phasing (Stacked-to-Main)

| PR | Feature | Est. Lines | 1,200 Budget |
|----|---------|-----------|-------------|
| #1 | Image display | ~40 | ✅ |
| #2 | Client management | ~350 | ✅ |
| #3 | Income/Expense (CategoriaGasto, Pago, Gasto) | ~500 | ✅ |
| #4 | Cheques | ~250 | ✅ |
| **Total** | | **~1,140** | **✅ Under** |

PRs are independent (different domains, no shared branch). Stack to main sequentially.

## Approach

**PR #1**: Add `imagen` to Vehiculo TS interface; render `<img>` in Flota.tsx card header replacing the "Foto próximamente" placeholder. Same pattern for Servicios.tsx. Zero backend changes.

**PR #2**: New `Cliente` model in `usuarios/`. Nullable FK on `Reserva` and `SolicitudCharter`. Keep existing inline fields as denormalized fallback. Admin ViewSet with search (nombre, email, telefono). Travel history queries Reserva+Charter by FK.

**PR #3**: `CategoriaGasto`, `Pago`, `Gasto` models in `finanzas/`. Admin ViewSets + serializers + CRUD pages. `DecimalField` for all monetary values (no floats). `Pago.cliente` FK to Cliente (requires PR #2).

**PR #4**: `Cheque` model with estado workflow (recibido → depositado/rechazado/entregado). Admin CRUD with date-range filtering.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/pages/Flota.tsx` | Modified | Render imagen as `<img>` |
| `frontend/src/pages/Servicios.tsx` | Modified | Add image to card |
| `backend/usuarios/` | New | Cliente model, serializer, viewset, admin |
| `backend/reservas/models.py` | Modified | Add cliente FK (nullable) |
| `backend/charter/models.py` | Modified | Add cliente FK (nullable) |
| `backend/finanzas/` | New | CategoriaGasto, Pago, Gasto, Cheque models + CRUD |
| `backend/config/admin_api.py` | Modified | Register new admin routers |
| `frontend/src/components/admin/Sidebar.tsx` | Modified | Add nav links |
| `frontend/src/components/admin/BottomNav.tsx` | Modified | Enable placeholder items |
| `frontend/src/pages/admin/` | New | ClientsPage, Finanzas pages |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Financial data entry errors | Medium | DecimalField only, no floats. Owner reconciles vs paper. |
| Cliente FK — orphaned existing records | Low | Nullable FK + keep inline fields as fallback |
| Image serving in production | Medium | Works in dev. Prod infra (S3/nginx) is separate task. |
| Scope creep on financials | High | Phased: income/expense first, cheques second. Dashboard deferred. |

## Rollback Plan

Per-PR revert to main. DB backup before each migration. Nullable FKs + kept inline fields make client rollback safe. Financial models are greenfield — remove with zero data loss.

## Dependencies

- PR #1: none
- PR #2: none
- PR #3: depends on PR #2 (Pago.cliente → Cliente FK)
- PR #4: depends on PR #3 (Cheque may reference Pago)

## Success Criteria

- [ ] Flota.tsx and Servicios.tsx display uploaded images on mobile and desktop
- [ ] Admin creates/edits/searches Clientes; travel history shows linked Reservas + Charters
- [ ] Admin records Pagos and Gastos with categorías; amounts match paper records
- [ ] Cheque workflow: recibido → depositado/rechazado; full CRUD in admin
