# Tasks: Admin Mejoras

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,140 (40 + 350 + 500 + 250) |
| 1,200-line budget risk | Low |
| Chained PRs recommended | Yes |
| Suggested split | PR #1 Image Display → PR #2 Client Management → PR #3 Income/Expense → PR #4 Cheques |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

Total ~1,140 lines across 4 PRs. Under 1,200 budget. Stack to main sequentially.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Display vehicle/service images on public pages | PR #1 | Zero backend changes, ~40 lines |
| 2 | Cliente model + admin CRUD + FK migration + travel history | PR #2 | ~350 lines |
| 3 | Income/Expense (CategoriaGasto, Pago, Gasto) | PR #3 | Depends on PR #2, ~500 lines |
| 4 | Cheque workflow management | PR #4 | Depends on PR #3, ~250 lines |

## PR #1 — Image Display (Public Pages, ~40 lines)

Backend unchanged. Images already served via API.

- [x] PR1-1 `frontend/src/pages/Flota.tsx` — add `imagen` to Vehiculo interface; conditional `<img>` or placeholder SVG
- [x] PR1-2 `frontend/src/pages/Servicios.tsx` — same conditional image render on service cards

## PR #2 — Client Management (~350 lines)

- [x] PR2-1 `backend/usuarios/models.py` — add `Cliente` model (nombre, email, telefono, direccion, notas, creado, actualizado)
- [x] PR2-2 `backend/usuarios/migrations/` — create + run Cliente migration
- [x] PR2-3 `backend/reservas/models.py` — add nullable `cliente` FK to `Reserva`; create migration
- [x] PR2-4 `backend/charter/models.py` — add nullable `cliente` FK to `SolicitudCharter`; create migration
- [x] PR2-5 `backend/usuarios/serializers.py` — create `ClienteSerializer` with nested reserva/charter history (SerializerMethodField)
- [x] PR2-6 `backend/usuarios/admin_views.py` — create `ClienteViewSet` (ModelViewSet, search by nombre/email/telefono, ordering, pagination)
- [x] PR2-7 `backend/config/admin_api.py` — register `admin_router.register('clientes', ClienteViewSet)`
- [x] PR2-8 `frontend/src/pages/admin/ClientesPage.tsx` — DataTable + FormModal + ConfirmDialog + travel history tab (Reservas/Charters)
- [x] PR2-9 `frontend/src/components/admin/forms/ClientForm.tsx` — react-hook-form + Zod (nombre, email, telefono, direccion, notas)
- [x] PR2-10 `frontend/src/App.tsx` + Sidebar.tsx + BottomNav.tsx — add /admin/clientes route and nav links

## PR #3 — Income/Expense (~500 lines)

- [x] PR3-1 `backend/finanzas/models.py` — add `CategoriaGasto` (nombre, descripcion), `Pago` (cliente FK, monto, fecha, descripcion, metodo_pago), `Gasto` (categoria FK, monto, fecha, descripcion, proveedor)
- [x] PR3-2 `backend/finanzas/migrations/` — create + run migration
- [x] PR3-3 `backend/finanzas/serializers.py` — CategoriaGastoSerializer, PagoSerializer, GastoSerializer
- [x] PR3-4 `backend/finanzas/admin_views.py` — CategoriaGastoViewSet (read-only), PagoViewSet, GastoViewSet (all ModelViewSet with date-range filtering)
- [x] PR3-5 `backend/config/admin_api.py` — register pagos, gastos, categorias-gasto routes
- [x] PR3-6 `frontend/src/pages/admin/PagosPage.tsx` — DataTable + FormModal + date-range filter
- [x] PR3-7 `frontend/src/pages/admin/GastosPage.tsx` — DataTable + FormModal + date-range filter
- [x] PR3-8 `frontend/src/pages/admin/CategoriasGastoPage.tsx` — read-only list table
- [x] PR3-9 `frontend/src/components/admin/forms/` — PagoForm + GastoForm (rhf + Zod, Decimal inputs, date picker, category select)
- [x] PR3-10 `frontend/src/App.tsx` + Sidebar.tsx + BottomNav.tsx — add routes and nav links for Pagos, Gastos, Categorías

## PR #4 — Cheques (~250 lines)

- [ ] PR4-1 `backend/finanzas/models.py` — add `Cheque` model (numero, banco, monto, estado choices, fecha_emision, fecha_cobro, cliente FK, pago FK, notas) with `clean()` state transition guard
- [ ] PR4-2 `backend/finanzas/migrations/` — create + run migration
- [ ] PR4-3 `backend/finanzas/serializers.py` + `admin_views.py` — ChequeSerializer + ChequeViewSet (filterset by estado, override perform_update for transition guard)
- [ ] PR4-4 `backend/config/admin_api.py` — register cheques route
- [ ] PR4-5 `frontend/src/pages/admin/ChequesPage.tsx` — DataTable with color-coded estado badges + action buttons for transitions (recibido→depositado/rechazado/entregado)
- [ ] PR4-6 `frontend/src/App.tsx` + Sidebar.tsx + BottomNav.tsx — add /admin/cheques route and nav link
