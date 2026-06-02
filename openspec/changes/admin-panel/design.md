# Design: Admin Panel — PR #1 (Auth + Core CRUD)

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  Frontend (React 19 + Vite 8 + Tailwind v4)          │
│                                                       │
│  AuthContext ──► Axios Interceptor ──► React Query    │
│       │               │                    │          │
│       │               │              useQuery/admin/*  │
│       ▼               ▼                    ▼          │
│  LoginPage   JWT Bearer            AdminLayout         │
│  ProtectedRoute  token        Fleet|Services|Routes    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS /api/*
┌──────────────────────▼──────────────────────────────┐
│  Backend (Django 5.2 + DRF 3.16)                     │
│                                                       │
│  simplejwt (TokenObtainPair + TokenRefresh)           │
│       │                                               │
│       ▼                                               │
│  /api/admin/ router (IsAuthenticated)                 │
│       │                                               │
│       ├── AdminVehiculoViewSet (ModelViewSet)         │
│       ├── AdminServicioViewSet (ModelViewSet)         │
│       ├── AdminRutaViewSet    (ModelViewSet)          │
│       └── AdminSalidaViewSet  (ModelViewSet)          │
│       │                                               │
│       ▼                                               │
│  Public /api/ router (AllowAny, ReadOnly, unchanged)  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
                  SQLite (dev)
```

**Key principle**: public API is untouched. Admin views are separate `Admin*ViewSet` classes that extend `ModelViewSet` with full CRUD, while existing public views stay `ReadOnlyModelViewSet`.

## Route Design

| Frontend Route | Component | Auth Required |
|---|---|---|
| `/admin/login` | LoginPage ❌ | No |
| `/admin` | ↳ redirect to `/admin/dashboard` | Yes |
| `/admin/dashboard` | DashboardPage (stub) | Yes |
| `/admin/flota` | FleetPage | Yes |
| `/admin/servicios` | ServicesPage | Yes |
| `/admin/rutas` | RoutesPage | Yes |
| `/admin/salidas` | DeparturesPage | Yes |

## Architecture Decisions

### Decision: Separate Admin ViewSets (not permission-gating the same ViewSet)

**Choice**: Create `AdminVehiculoViewSet(viewsets.ModelViewSet)` alongside existing `VehiculoViewSet(ReadOnlyModelViewSet)` — same pattern for Servicio, Ruta.

| Option | Tradeoff |
|--------|----------|
| Permission classes on same ViewSet | One ViewSet with dynamic permissions — branches on request.user everywhere |
| **Separate Admin ViewSets** | Clearer code, no risk of leaking write access to public API, follows Single Responsibility |

**Rationale**: The public API and admin API have fundamentally different query sets (public: `filter(activo=True)`; admin: all records). Same ViewSet with branching `get_queryset` is fragile. Separate classes are explicit and testable.

### Decision: Admin API at `/api/admin/` (sub-namespace)

**Choice**: Mount admin ViewSets under `/api/admin/` with the same resource names as public API.

- Admin endpoints mirror public: `/api/admin/vehiculos/`, `/api/admin/servicios/` etc.
- No versioning needed at this scale — admin only, single owner.

### Decision: Sliding refresh tokens disabled

**Choice**: `SIMPLE_JWT` defaults — no rotation, fixed expiry (access=30min, refresh=24h).

| Option | Tradeoff |
|--------|----------|
| Rotating refresh | More secure, but forces re-auth after session ends — bad UX for phone-in-pocket owner |
| Sliding token | Convenient, but token never expires if used regularly — over-engineered for single owner |
| **Fixed expiry + interceptor refresh** | Simple. Owner logs in once daily. 30-min window of vulnerability is acceptable for local admin panel |

### Decision: Departures as standalone page + route filter

**Choice**: `/admin/salidas` with a `<select>` route filter, NOT a nested page under each route.

| Option | Tradeoff |
|--------|----------|
| Nested `/admin/rutas/:id/salidas` | Requires breadcrumb nav, more API calls per view change |
| **Standalone + filter** | Single page, one API call, filter is instant — better mobile UX |

## Data Flow

```
┌──────┐     ┌─────────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────┐
│ User │────►│ React Query     │────►│ Axios       │────►│ DRF          │────►│ Model  │
│      │     │ useMutation     │     │ interceptor │     │ ModelViewSet │     │        │
│      │     │                 │     │ Bearer JWT  │     │ Admin*ViewSet│     │   DB   │
│      │     │ onSuccess:      │     │ auto-refresh│     │ Serializer   │     │        │
│      │     │ invalidate key  │     │ on 401      │     │ validates    │     │        │
└──────┘     └─────────────────┘     └─────────────┘     └──────────────┘     └────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │ Response     │
                                            │ JSON data    │
                                            └──────────────┘
```

## Component Tree

```
AdminLayout
├── Sidebar (≥768px: collapsible 240px / 64px)
├── BottomNav (<768px: 5 icons + "Más" drawer)
├── TopBar (user name, logout)
└── <Outlet />
    ├── LoginPage (NO AdminLayout — standalone)
    ├── DashboardPage (Lucid icon cards, placeholder)
    ├── FleetPage
    │   ├── DataTable (sortable, paginated)
    │   ├── FormModal → FleetForm (react-hook-form + Zod)
    │   └── ConfirmDialog (sonner toast on success/error)
    ├── ServicesPage (same pattern)
    ├── RoutesPage (same pattern)
    └── DeparturesPage
        ├── RouteFilter (dropdown)
        ├── DataTable
        ├── FormModal → DepartureForm
        └── ConfirmDialog
```

## API Contract

All admin endpoints require `Authorization: Bearer <access-token>`.

### Auth

| Method | Endpoint | Auth | Request | Response |
|--------|----------|------|---------|----------|
| POST | `/api/auth/token/` | No | `{ email, password }` | `{ access, refresh }` — 200 |
| POST | `/api/auth/token/refresh/` | No | `{ refresh }` | `{ access }` — 200 |
| POST | `/api/auth/token/verify/` | No | `{ token }` | `{}` — 200 |

### Admin — CRUD

| Method | Endpoint | Perm | Payload / Notes |
|--------|----------|------|-----------------|
| GET | `/api/admin/vehiculos/` | IsAuthenticated | List all (including inactive). Query: `?search=&ordering=` |
| POST | `/api/admin/vehiculos/` | IsAuthenticated | `{ nombre, tipo, capacidad, patente, descripcion, imagen, activo, orden }` |
| GET | `/api/admin/vehiculos/:id/` | IsAuthenticated | Detail |
| PATCH | `/api/admin/vehiculos/:id/` | IsAuthenticated | Partial update |
| DELETE | `/api/admin/vehiculos/:id/` | IsAuthenticated | Destroys record |
| *(same pattern)* | `/api/admin/servicios/` | ... | Fields: `{ nombre, descripcion_corta, descripcion_larga, icono, imagen, activo, orden }` |
| *(same pattern)* | `/api/admin/rutas/` | ... | Fields: `{ nombre, origen, destino, duracion_estimada, descripcion, imagen, activo, orden }` |
| *(same pattern)* | `/api/admin/salidas/` | ... | Fields: `{ ruta, dia_semana, hora_salida, vehiculo, precio_base, precio_promocional, promocion_activa, activo }` |

Admin serializers add write fields that public serializers omit: `activo`, `orden`, `imagen` (on Ruta), `precio_promocional`/`promocion_activa` (on Salida).

## Mobile Strategy

| Concern | Decision |
|---------|----------|
| Tables on mobile | Horizontal scroll wrapper (`overflow-x: auto`) + sticky first column (name/ID) |
| Forms | Single-column, full-width, stacked labels. Bottom sheet (not modal) on mobile |
| Image upload | `<input type="file" capture="environment" accept="image/*">` — native camera integration |
| Touch targets | `min-h-[44px] min-w-[44px]` on all interactive elements |
| Pull-to-refresh | Custom pull-to-refresh container on list pages (no library — 150 lines or less) |
| Sidebar vs nav | `< 768px`: BottomNav with 5 tabs + "Más" drawer |
| Loading states | Skeleton rows on list, spinner overlay on form submit |
| Empty state | "No hay registros" illustration + CTA to create first record |

## Error Handling

| Layer | Strategy |
|-------|----------|
| **Axios interceptor** | On 401 → try `/api/auth/token/refresh/` → retry original request once. If refresh fails → clear tokens → redirect to `/admin/login` |
| **React Query** | `onError` per mutation → show sonner toast with server error message. `retry: 1` on queries (network flaps), `retry: 0` on mutations (duplicate errors should surface immediately) |
| **DRF validation** | Return `400 { field: ["error message"] }`. Frontend maps field errors to form inputs via react-hook-form's `setError` |
| **Network errors** | Catch block → "Error de conexión. Verificá tu conexión a internet." toast. No form clearing |
| **500 errors** | Sonner toast "Ocurrió un error inesperado. Intentá de nuevo." with a contact-support fallback |
| **Token expiry mid-form** | Interceptor handles it transparently. If refresh also fails → redirect to login. Current form data is lost (acceptable for MVP — owner will learn to save frequently) |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/requirements.txt` | Modify | Add `djangorestframework-simplejwt` |
| `backend/config/settings.py` | Modify | Add simplejwt to INSTALLED_APPS, REST_FRAMEWORK defaults (JWT auth, AllowAll), SIMPLE_JWT config |
| `backend/config/urls.py` | Modify | Add `path('api/auth/', include('rest_framework_simplejwt.urls'))`, admin API include |
| `backend/config/admin_api.py` | Create | New router with admin-prefixed endpoints, IsAuthenticated default |
| `backend/flota/views.py` | Modify | Add `AdminVehiculoViewSet(ModelViewSet)` — queryset: all (no activo filter) |
| `backend/flota/serializers.py` | Modify | Add `AdminVehiculoSerializer` — write-enabled, `patente` + `activo` + `orden` exposed |
| `backend/servicios/views.py` | Modify | Add `AdminServicioViewSet(ModelViewSet)` |
| `backend/servicios/serializers.py` | Modify | Add `AdminServicioSerializer` — write-enabled, `activo` + `orden` exposed |
| `backend/rutas/models.py` | Modify | Add `Ruta.imagen` (ImageField, null), `Salida.precio_promocional` (Decimal), `Salida.promocion_activa` (Boolean) |
| `backend/rutas/views.py` | Modify | Add `AdminRutaViewSet(ModelViewSet)`, `AdminSalidaViewSet(ModelViewSet)` |
| `backend/rutas/serializers.py` | Modify | Add `AdminRutaSerializer`, `AdminSalidaSerializer` — write-enabled, new promo fields |
| `backend/rutas/migrations/` | Create | Schema migration for new Ruta + Salida fields |
| `frontend/package.json` | Modify | Add `@tanstack/react-query`, `sonner`, `date-fns` |
| `frontend/src/lib/api.ts` | Modify | Add JWT interceptor (attach token, auto-refresh on 401) |
| `frontend/src/lib/queryClient.ts` | Create | React Query client + provider |
| `frontend/src/contexts/AuthContext.tsx` | Create | Auth provider: `{ user, login, logout, isLoading, isAuthenticated }` |
| `frontend/src/components/admin/ProtectedRoute.tsx` | Create | Redirect to `/admin/login` if unauthenticated |
| `frontend/src/components/admin/AdminLayout.tsx` | Create | Shell: sidebar + bottom nav + Outlet |
| `frontend/src/components/admin/Sidebar.tsx` | Create | Collapsible desktop nav (240px/64px) |
| `frontend/src/components/admin/BottomNav.tsx` | Create | Mobile bottom nav (5 tabs + drawer) |
| `frontend/src/components/admin/DataTable.tsx` | Create | Reusable sortable/paginated table |
| `frontend/src/components/admin/FormModal.tsx` | Create | Modal/bottom-sheet wrapper for forms |
| `frontend/src/components/admin/ConfirmDialog.tsx` | Create | Delete confirmation dialog |
| `frontend/src/components/admin/forms/FleetForm.tsx` | Create | react-hook-form + Zod schema |
| `frontend/src/components/admin/forms/ServiceForm.tsx` | Create | Same pattern |
| `frontend/src/components/admin/forms/RouteForm.tsx` | Create | Same pattern |
| `frontend/src/components/admin/forms/DepartureForm.tsx` | Create | FK dropdowns for ruta + vehiculo |
| `frontend/src/pages/admin/LoginPage.tsx` | Create | Standalone page (no AdminLayout) |
| `frontend/src/pages/admin/DashboardPage.tsx` | Create | Stub with icon cards |
| `frontend/src/pages/admin/FleetPage.tsx` | Create | Uses DataTable + FormModal + ConfirmDialog |
| `frontend/src/pages/admin/ServicesPage.tsx` | Create | Same pattern |
| `frontend/src/pages/admin/RoutesPage.tsx` | Create | Same pattern + "Ver salidas" link |
| `frontend/src/pages/admin/DeparturesPage.tsx` | Create | Route filter + CRUD |
| `frontend/src/App.tsx` | Modify | Add admin routes with ProtectedRoute wrapper |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Backend — Auth | Token obtain, refresh, verify, 401 on invalid | Django test client + APIClient |
| Backend — Admin CRUD | Create/read/update/delete on each admin ViewSet | DRF APITestCase with authenticated client |
| Backend — Public isolation | Public endpoints still return read-only, activo-filtered | Same test suite — prove existing behavior untouched |
| Frontend — Integration | Login flow, protected route redirect, CRUD table render | Manual (no test runner configured) |
| Frontend — Build | TypeScript compiles, Vite builds | `npm run build` |

## Rollback / Contingency

- **Per PR**: revert the PR branch. All phases target `feat/admin-panel` (not `main`). Rollback is branch-deletion safe.
- **DB**: `sqlite3` backup before migrations. Restore via copy + migration reversal.
- **New fields on Ruta/Salida**: nullable defaults — no data loss on rollback.
- **Feature flag**: all admin routes are behind `/admin/*` path. If critical bug surfaces, remove the admin route import from `App.tsx` — public site is completely unaffected.

## Open Questions

- [ ] Should we create the `usuarios` Django app now (empty) to establish the pattern, or wait until PR #2? (Proposal lists it, but PR #1 doesn't need it — simplejwt works with auth.User directly.)
- [ ] Image upload: use Django's FileField + serve via dev static or configure a dedicated media endpoint? (Current `urls.py` already has `static(settings.MEDIA_URL...)` — confirm this handles admin uploads.)
- [ ] `sonner` vs native toast: sonner is listed in the proposal but the app has no toast patterns yet. Worth the dependency or use a simple `<div>` for MVP?
