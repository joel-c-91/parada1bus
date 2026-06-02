# Admin Layout Specification

## Purpose

Provide a dedicated layout for admin routes, separate from the public-facing Layout (Navbar + Footer). The admin layout adapts to screen size: collapsible sidebar on desktop, bottom navigation on mobile.

## Requirements

### Requirement: AdminLayout structure

The system MUST render an `AdminLayout` component wrapping all `/admin/*` routes. The layout MUST NOT include the public Navbar or Footer. It MUST include an `<Outlet />` for nested route content.

#### Scenario: Admin route renders within AdminLayout

- GIVEN an authenticated user on `/admin/dashboard`
- WHEN the page loads
- THEN the public Navbar and Footer MUST NOT be visible
- AND the admin sidebar or bottom nav MUST be visible

### Requirement: Desktop sidebar

On viewports 768px and wider, the system MUST render a collapsible vertical sidebar containing: navigation links, a user avatar, and a logout button. The sidebar MUST be collapsible to icon-only mode via a toggle.

#### Scenario: Navigate via sidebar

- GIVEN an authenticated user on `/admin/dashboard`
- WHEN they click "Flota" in the sidebar
- THEN the browser MUST navigate to `/admin/flota`
- AND the sidebar MUST highlight the active section

#### Scenario: Collapse sidebar

- GIVEN an authenticated user with the sidebar expanded
- WHEN they click the collapse toggle
- THEN the sidebar MUST shrink to icon-only width
- AND navigation links MUST remain accessible as icons with tooltips

### Requirement: Mobile bottom nav

On viewports below 768px, the system MUST render a fixed bottom navigation bar with at least 5 icon-labeled sections. Touch targets MUST be at least 44x44px.

#### Scenario: Mobile navigation

- GIVEN an authenticated user on a device narrower than 768px
- WHEN they tap the "Servicios" icon in the bottom nav
- THEN the browser MUST navigate to `/admin/servicios`

### Requirement: ProtectedRoute wrapper

Unauthenticated users MUST be redirected to `/admin/login` when accessing any `/admin/*` route. The `ProtectedRoute` component MUST check authentication state and conditionally render children or redirect.

#### Scenario: Redirect to login

- GIVEN no valid auth tokens stored
- WHEN a user navigates to `/admin/flota`
- THEN they MUST be redirected to `/admin/login`

### Requirement: Client-side token interceptor

All outgoing API requests MUST include the JWT access token in the `Authorization: Bearer` header. The interceptor MUST attempt to refresh the token when a 401 response is received, then retry the original request once.

#### Scenario: Auto-refresh on 401

- GIVEN an expired access token but a valid refresh token
- WHEN any API request returns 401
- THEN the interceptor MUST call `/api/auth/token/refresh/` and retry the original request

#### Scenario: Logout clears tokens

- GIVEN an authenticated user
- WHEN they click Logout
- THEN tokens MUST be removed from storage
- AND the user MUST be redirected to `/admin/login`
