# Fleet CRUD Specification

## Purpose

Provide full create, read, update, and delete capabilities for the Vehiculo (vehicle) model from the admin panel. The existing `VehiculoViewSet` changes from read-only to full `ModelViewSet`.

## Requirements

### Requirement: Vehicle listing

The system MUST display all vehicles in a table at `/admin/flota`. Columns MUST include: nombre, tipo, capacidad, patente, activo, and orden. The table MUST support sorting and pagination.

#### Scenario: View all vehicles

- GIVEN two vehicles exist (one active, one inactive)
- WHEN the admin navigates to `/admin/flota`
- THEN both vehicles MUST appear in the table
- AND the activo column MUST show their status visually

### Requirement: Create vehicle

The system MUST provide a create form with fields: nombre (text), tipo (select: van/minibus/bus), capacidad (number), patente (text, unique), descripcion (textarea), imagen (file upload with preview), activo (toggle), orden (number). The form MUST validate via Zod on the frontend and DRF validation on the backend.

#### Scenario: Create and confirm

- GIVEN the admin is on the fleet page
- WHEN they fill the form with valid data and upload an image
- THEN the vehicle MUST appear in the table
- AND the image preview MUST show before saving
- AND the public Flota page MUST reflect the new vehicle

#### Scenario: Create with duplicate patente

- GIVEN a vehicle with patente "ABC123" already exists
- WHEN the admin tries to create another with the same patente
- THEN the form MUST display a validation error
- AND no duplicate vehicle MUST be created

### Requirement: Edit vehicle

The system MUST provide an edit mode that pre-fills the form with existing values. Changes MUST persist immediately on save.

#### Scenario: Update name and image

- GIVEN an existing vehicle
- WHEN the admin changes its name and uploads a new image
- THEN the table MUST show the updated name
- AND the public site MUST display the new image

### Requirement: Deactivate vehicle

The system MUST allow toggling the `activo` field. Deactivated vehicles MUST disappear from the public site but remain visible and editable in the admin panel.

#### Scenario: Deactivate vehicle

- GIVEN an active vehicle visible on the public Flota page
- WHEN the admin sets `activo` to false
- THEN the vehicle MUST remain in the admin table (with inactive state)
- AND the public Flota page MUST NOT show it

### Requirement: Delete vehicle

The system MUST provide a delete action with a confirmation dialog. Upon confirmation, the vehicle MUST be removed from the database.

#### Scenario: Delete with confirmation

- GIVEN an existing vehicle
- WHEN the admin clicks Delete and confirms
- THEN the vehicle MUST be removed from the database
- AND it MUST disappear from both admin and public pages
