# Service CRUD Specification

## Purpose

Provide full create, read, update, and delete capabilities for the Servicio model from the admin panel. The existing `ServicioViewSet` changes from read-only to full `ModelViewSet`.

## Requirements

### Requirement: Service listing

The system MUST display all services in a table at `/admin/servicios`. Columns MUST include: nombre, descripcion_corta, activo, and orden. The table MUST support sorting and pagination.

#### Scenario: View all services

- GIVEN two servicios exist (one active, one inactive)
- WHEN the admin navigates to `/admin/servicios`
- THEN both services MUST appear in the table
- AND the activo column MUST show their status

### Requirement: Create service

The system MUST provide a create form with fields: nombre (text), descripcion_corta (text), descripcion_larga (textarea), icono (text), imagen (file upload with preview), activo (toggle), orden (number). The form MUST validate via Zod on the frontend and DRF validation on the backend.

#### Scenario: Create new service

- GIVEN the admin is on the services page
- WHEN they fill the form with valid data and upload an image
- THEN the service MUST appear in the table
- AND the public Servicios page MUST reflect the new service

### Requirement: Edit service

The system MUST provide an edit mode that pre-fills the form with existing values. Changes MUST persist immediately.

#### Scenario: Update description and deactivate

- GIVEN an existing active service
- WHEN the admin updates the descripcion_corta and sets activo to false
- THEN the table MUST show the updated text
- AND the public site MUST hide the deactivated service

### Requirement: Delete service

The system MUST provide a delete action with a confirmation dialog. Upon confirmation, the service MUST be removed from the database.

#### Scenario: Delete with confirmation

- GIVEN an existing service
- WHEN the admin clicks Delete and confirms
- THEN the service MUST be removed from the database
- AND it MUST disappear from both admin and public pages
