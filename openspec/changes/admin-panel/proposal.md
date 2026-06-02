# Proposal: Admin Panel — Parada 1 Bus

## Intent

Replace WhatsApp/paper workflows with a digital admin panel. Owner manages fleet, services, routes, reservations, charters, clients, finances, and promotions from a single mobile-first interface.

## Scope

### In Scope
- JWT auth + role-based access (admin only)
- CRUD panels for Flota, Servicios, Rutas, Salidas, Reservas, Charter
- Client extraction from Reserva/Charter into a Cliente model
- Reservation + charter management with status workflow
- Financial system: Pagos, Gastos, Cheques, FlujoCaja
- Promotions + Special Trips management
- Dashboard KPIs + multas tracker
- Admin layout: collapsible sidebar (desktop), bottom nav (mobile) — existing public site untouched

### Out of Scope
- Public-facing site changes (existing public React app stays untouched)
- Real-time notifications or WebSockets
- Payment gateway integration (Pagos are manual/internal)
- Automated accounting or tax reporting
- Multi-tenant or multiple admin users

## Capabilities

> Contract between proposal and specs. Each new capability becomes `openspec/specs/<name>/spec.md`.

### New Capabilities
- `admin-auth`: JWT authentication, login endpoint, token refresh, protected API
- `admin-layout`: AdminLayout component with collapsible sidebar and mobile bottom nav
- `fleet-crud`: CRUD for Vehiculo model (name, type, capacity, image)
- `service-crud`: CRUD for Servicio model (name, description, icon, image)
- `route-crud`: CRUD for Ruta + Salida models with schedule management
- `client-management`: Cliente model, FK migration from Reserva/Charter, management panel
- `reservation-admin`: Admin reservation panel with status workflow and payment tracking
- `charter-admin`: Admin charter panel with cotización workflow
- `financial-records`: Pago, Gasto, Cheque, FlujoCaja models and CRUD
- `promotions`: Promocion and ViajeEspecial models and CRUD
- `admin-config`: Key-value site configuration editor
- `admin-dashboard`: KPI cards, charts, multas tracker

### Modified Capabilities
None — no existing `openspec/specs/` specs exist. This is a greenfield admin capability.

## Phases

| Phase | Deliverables | Est. PR |
|-------|------------|---------|
| 1. Auth + Layout | JWT login, AdminLayout, `/admin/*` routes, protected routing | PR #1 |
| 2. Core CRUD | CRUD for Vehiculo, Servicio, Ruta, Salida + ImageUpload | PR #1 |
| 3. Clients + Charters + Reservations | Cliente FK migration, charter + reservation panels with status workflow | PR #2 |
| 4. Financial | Pago, Gasto, Cheque, FlujoCaja CRUD, cash flow report | PR #3 |
| 5. Promotions + Config | Promocion, ViajeEspecial models, site config editor | PR #4 |
| 6. Dashboard + Polish | KPI cards, multas tracker, mobile QA refinements | PR #5 |

## Delivery Strategy

**Force-chained PRs** — Feature Branch Chain via `feat/admin-panel` tracker branch. PR #1 bundles Fase 1+2 as a quick win to demonstrate value to the owner (login + edit fleet/services/routes in under 3 days). Each subsequent phase becomes its own PR targeting the tracker. All phases must integrate before the tracker merges to `main`.

> **Why Fase 1+2 first**: Owner sees a working UI within days — login, see vehicles, edit services. This builds trust and unlocks budget for the remaining phases.

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **simplejwt** for auth | Pluggable, battle-tested, 5-min setup. Auth is a commodity, not a differentiator. |
| **React Query** (not Redux/Zustand) | Server state only — no complex client state. React Query handles caching, pagination, refetch out of the box. Adding Zustand would be over-engineering. |
| **New `finanzas` app** | Pago/Gasto/Cheque/FlujoCaja have no home in existing apps. Shoehorning into reservas or charter would create awkward FK pollution. |
| **Cliente FK migration** | Extract name/email/telefono from Reserva+Charter into a Cliente model with FK. Retroactive linking to existing records is not viable without manual matching — existing records get `cliente=NULL` and a manual-reconcile tool. |
| **New Django apps**: `usuarios`, `finanzas`, `promociones`, `configuracion` | Each has a distinct domain boundary. Avoids bloating existing apps with admin-only models. |

## New Django Apps

| App | Models | Purpose |
|-----|--------|---------|
| `usuarios` | — (extend auth.User or proxy) | Admin user management, JWT endpoints |
| `finanzas` | Pago, Gasto, Cheque, FlujoCaja | Financial tracking |
| `promociones` | Promocion, ViajeEspecial | Marketing and special trips |
| `configuracion` | Configuracion (key-value) | Site-wide toggleable settings |

## New Frontend Dependencies

- `@tanstack/react-query` — server state management
- `recharts` — financial charts
- `sonner` — toast notifications
- `date-fns` — date formatting

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/config/settings.py` | Modified | Add 4 new apps, REST_FRAMEWORK JWT defaults |
| `backend/config/urls.py` | Modified | Add admin-namespaced API routes |
| `backend/*/views.py` | Modified | Add admin-specific ModelViewSets (read-only → full CRUD) |
| `backend/*/serializers.py` | Modified | Admin serializers with extra fields |
| `frontend/src/App.tsx` | Modified | Add `/admin/*` routes with AdminLayout |
| `frontend/src/lib/api.ts` | Modified | Add JWT interceptor |
| `frontend/package.json` | Modified | Add 4 new dependencies |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Financial record errors corrupt busines truth | Medium | Decimal fields only (no floats); manual audit report per phase; export-to-CSV feature |
| Owner rejects mobile UX | High | Mobile-first from day 1; test on actual Android phone after every phase; iterate before moving forward |
| Data loss during Cliente migration | Low | Migration script with dry-run mode; `sqlite3` backup before running; FK nullable for unmatched records |

## Rollback Plan

- **Per PR**: revert the PR branch. All phases target `feat/admin-panel`, not `main`, so rollback is branch-deletion safe.
- **DB**: `sqlite3` backup before every migration. Revert via `git checkout -- backend/db.sqlite3` + restore from backup.
- **Client migration**: keep `nombre`/`email`/`telefono` columns on Reserva and Charter as denormalized fallback. If Cliente model breaks, drop FK and read from original fields.

## Dependencies

- `djangorestframework-simplejwt` (backend pip install)
- `@tanstack/react-query`, `recharts`, `sonner`, `date-fns` (frontend npm install)
- Owner's Android phone for mobile QA

## Success Criteria

- [ ] Owner logs in via JWT and sees admin sidebar with navigation
- [ ] Full CRUD on Flota, Servicios, Rutas — changes reflect on public site immediately
- [ ] Clients are managed from a single panel; existing reservations link to clients
- [ ] Charter requests have a status workflow (pendiente → cotizado → aceptado/rechazado)
- [ ] Financial records (Pagos, Gastos, Cheques) match manual paper records within 1% tolerance
- [ ] Dashboard shows at-a-glance KPIs: total vehículos, reservas del mes, cash flow trend
- [ ] Owner can edit Promociones and they appear on the public site
- [ ] Entire panel works on a phone screen without zooming
