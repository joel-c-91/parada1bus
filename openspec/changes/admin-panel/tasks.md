# Tasks: Admin Panel — PR #1 (Auth + Core CRUD)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR-a: Backend → PR-b: Frontend Auth+Layout → PR-c: Frontend CRUD |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend: deps, JWT, admin CRUD, migrations, tests | PR-a | base: `feat/admin-panel` tracker |
| 2 | Frontend: deps, API client, AuthContext, Login, AdminLayout | PR-b | base: PR-a branch |
| 3 | Frontend: DataTable, FormModal, all 4 CRUD pages, Dashboard, routes | PR-c | base: PR-b branch |

## Phase 0: New Apps (PR-a addition)

- [x] 0.1 Create `usuarios`, `finanzas`, `promociones`, `configuracion` Django apps + register in INSTALLED_APPS

## Phase 1: Backend Foundation

- [x] 1.1 Add `djangorestframework-simplejwt` to `backend/requirements.txt`
- [x] 1.2 Configure REST_FRAMEWORK JWT auth + SIMPLE_JWT defaults in `settings.py`
- [x] 1.3 Create `backend/config/admin_api.py` — router with IsAuthenticated default
- [x] 1.4 Wire `/api/auth/` (simplejwt) and `/api/admin/` (admin_api) in `urls.py`

## Phase 2: Backend Model Changes

- [x] 2.1 Add `imagen` ImageField to Ruta, `precio_promocional` + `promocion_activa` to Salida in `rutas/models.py`
- [x] 2.2 Generate + run migration for new fields (nullable, safe defaults)

## Phase 3: Backend Admin CRUD

- [x] 3.1 Add AdminVehiculoViewSet (ModelViewSet) + AdminVehiculoSerializer (write fields: patente, activo, orden) in `flota/`
- [x] 3.2 Add AdminServicioViewSet + AdminServicioSerializer in `servicios/`
- [x] 3.3 Add AdminRutaViewSet + AdminRutaSerializer in `rutas/`
- [x] 3.4 Add AdminSalidaViewSet + AdminSalidaSerializer in `rutas/`

## Phase 4: Backend Tests

- [ ] 4.1 Write Django tests: auth token obtain/refresh/verify + 401 on unauthenticated
- [ ] 4.2 Write DRF tests: CRUD on all 4 admin endpoints + public isolation unchanged

## Phase 5: Frontend Foundation

- [x] 5.1 Add `@tanstack/react-query`, `sonner`, `date-fns` deps to `package.json`
- [x] 5.2 Create `src/lib/queryClient.tsx` — QueryClient + Toaster provider wrapper
- [x] 5.3 Create `src/lib/api.ts` — Axios instance with JWT interceptor (attach Bearer, auto-refresh on 401)

## Phase 6: Frontend Auth

- [x] 6.1 Create `src/contexts/AuthContext.tsx` — login/logout/isLoading/isAuthenticated + localStorage token mgmt
- [x] 6.2 Create `src/components/admin/ProtectedRoute.tsx` — redirect to /admin/login when unauthenticated
- [x] 6.3 Create `src/pages/admin/LoginPage.tsx` — email+password form, error display, calls AuthContext.login

## Phase 7: Frontend Layout

- [x] 7.1 Create `src/components/admin/Sidebar.tsx` — collapsible desktop sidebar (240px/64px) with nav links + logout
- [x] 7.2 Create `src/components/admin/BottomNav.tsx` — mobile bottom nav bar (5 tabs + drawer, >44px targets)
- [x] 7.3 Create `src/components/admin/AdminLayout.tsx` — sidebar + bottom nav + Outlet shell

## Phase 8: Frontend Reusable Components

- [x] 8.1 Create `src/components/admin/DataTable.tsx` — sortable, paginated table with loading skeleton
- [x] 8.2 Create `src/components/admin/FormModal.tsx` — responsive modal (desktop) / bottom sheet (mobile)
- [x] 8.3 Create `src/components/admin/ConfirmDialog.tsx` — delete confirmation dialog
- [x] 8.4 Create `src/components/admin/EmptyState.tsx` — "No hay registros" + CTA button

## Phase 9: Frontend CRUD Pages

- [x] 9.1 Create FleetForm.tsx (react-hook-form + Zod schema) + FleetPage.tsx (DataTable + FormModal + ConfirmDialog) at `src/pages/admin/`
- [x] 9.2 Create ServiceForm.tsx + ServicesPage.tsx
- [x] 9.3 Create RouteForm.tsx + RoutesPage.tsx
- [x] 9.4 Create DepartureForm.tsx (FK dropdowns: ruta, vehiculo) + DeparturesPage.tsx (route filter)

## Phase 10: Wire + Finalize

- [x] 10.1 Create `src/pages/admin/DashboardPage.tsx` — stub with Lucide icon cards
- [x] 10.2 Wire `/admin/*` routes in `App.tsx` — ProtectedRoute wrapping AdminLayout, LoginPage standalone
- [x] 10.3 Verify: `npm run build` passes (no test runner installed, `npx tsc --noEmit` clean)
