# Admin Auth Specification

## Purpose

Provide JWT-based authentication for the admin panel. Admin users authenticate via email+password and receive access/refresh tokens. The frontend uses the refresh token to silently renew expired access tokens via an Axios interceptor.

## Requirements

### Requirement: Login endpoint

The system MUST expose `POST /api/auth/token/` accepting `email` and `password`. On success it MUST return an `access` token (short-lived) and a `refresh` token (long-lived). On failure it MUST return a 401 error with a descriptive message.

#### Scenario: Successful login

- GIVEN an admin user with valid credentials
- WHEN they POST `{ "email": "admin", "password": "admin123" }` to `/api/auth/token/`
- THEN the response MUST contain `access` and `refresh` tokens
- AND the status MUST be 200

#### Scenario: Failed login

- GIVEN an admin user with invalid credentials
- WHEN they POST invalid credentials to `/api/auth/token/`
- THEN the response MUST return status 401
- AND the response MUST contain a non-success detail message

### Requirement: Token refresh

The system MUST expose `POST /api/auth/token/refresh/` accepting a valid `refresh` token and returning a new `access` token. The system MUST also expose `POST /api/auth/token/verify/` to check token validity.

#### Scenario: Refresh expired access token

- GIVEN an expired access token and a valid refresh token
- WHEN the client POSTS `{ "refresh": "<valid-refresh>" }` to `/api/auth/token/refresh/`
- THEN the response MUST return a new `access` token with status 200

#### Scenario: Verify valid token

- GIVEN a valid access token
- WHEN the client POSTS `{ "token": "<valid-token>" }` to `/api/auth/token/verify/`
- THEN the response MUST return status 200 with no error

### Requirement: Protected admin API

All `/api/admin/*` endpoints MUST require a valid JWT access token via the `Authorization: Bearer <token>` header. Public endpoints MUST remain accessible without authentication.

#### Scenario: Unauthenticated request to admin API

- GIVEN no Authorization header
- WHEN a client requests any `/api/admin/*` endpoint
- THEN the response MUST return status 401

#### Scenario: Unauthenticated user visits `/admin/*`

- GIVEN an unauthenticated user
- WHEN they navigate to any `/admin/*` route
- THEN the frontend MUST redirect them to `/admin/login`

### Requirement: Login form

The frontend MUST provide a `LoginPage` with an email/username field, password field, submit button, and error display. The form MUST validate that both fields are non-empty before submission.

#### Scenario: Submit empty form

- GIVEN a LoginPage with empty email and password fields
- WHEN the user clicks Submit
- THEN the form MUST display inline validation errors
- AND no API request MUST be made
