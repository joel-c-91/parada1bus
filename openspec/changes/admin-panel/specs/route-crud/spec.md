# Route CRUD Specification

## Purpose

Provide full create, read, update, and delete capabilities for the Ruta (route) and Salida (departure) models from the admin panel. This requires two schema additions: an `imagen` field on Ruta (nullable), and `precio_promocional` + `promocion_activa` fields on Salida.

## Requirements

### Requirement: Route listing

The system MUST display all routes in a table at `/admin/rutas`. Columns MUST include: nombre, origen, destino, duracion_estimada, activo, and orden.

#### Scenario: View all routes

- GIVEN two rutas exist
- WHEN the admin navigates to `/admin/rutas`
- THEN both routes MUST appear in the table

### Requirement: Create route

The system MUST provide a create form with fields: nombre (text), origen (text), destino (text), duracion_estimada (text), descripcion (textarea), imagen (file upload, nullable — new field), activo (toggle), orden (number).

#### Scenario: Create route with image

- GIVEN the admin is on the routes page
- WHEN they fill the form and upload an image
- THEN the route MUST appear in the table
- AND the public site MUST show the new route with the uploaded image

### Requirement: Edit route

The system MUST provide an edit mode. Changes MUST persist immediately.

#### Scenario: Update route destination

- GIVEN an existing route
- WHEN the admin changes the destino field
- THEN the table MUST show the updated destination

### Requirement: Delete route

The system MUST provide a delete action with a confirmation dialog. Deleting a route MUST cascade-delete its salidas.

#### Scenario: Delete route with departures

- GIVEN a route with 3 linked salidas
- WHEN the admin deletes the route
- THEN the route AND all its salidas MUST be removed from the database
- AND the confirmation dialog MUST warn about cascade deletion

### Requirement: Departure listing

The system MUST display salidas at `/admin/salidas` (separate page from routes). The table MUST include: ruta (name), dia_semana, hora_salida, vehiculo (name), precio_base, precio_promocional, promocion_activa, activo.

#### Scenario: View departures table

- GIVEN multiple salidas exist across routes
- WHEN the admin navigates to `/admin/salidas`
- THEN all departures MUST appear with route name and vehicle name resolved

### Requirement: Create departure

The system MUST provide a create form with fields: ruta (FK dropdown), dia_semana (select), hora_salida (time picker), vehiculo (FK dropdown, filtered by activo vehicles), precio_base (decimal), precio_promocional (decimal, nullable — new field), promocion_activa (boolean, default false — new field), activo (toggle).

#### Scenario: Create departure with promo pricing

- GIVEN active vehicles and routes exist
- WHEN the admin fills the form with a promocion_activa and a precio_promocional lower than precio_base
- THEN the departure MUST appear in the table
- AND the public site MUST display the promotional price

#### Scenario: Vehicle dropdown filtered

- GIVEN active and inactive vehicles exist
- WHEN the admin opens the vehicle dropdown
- THEN only active vehicles MUST be listed

### Requirement: Edit departure

The system MUST provide an edit mode for all salida fields.

#### Scenario: Update departure time and price

- GIVEN an existing departure
- WHEN the admin changes its hora_salida and precio_base
- THEN the table MUST reflect the updated values

### Requirement: Delete departure

The system MUST provide a delete action with confirmation dialog.

#### Scenario: Delete single departure

- GIVEN an existing departure
- WHEN the admin deletes it
- THEN the departure MUST be removed from the database
- AND other departures for the same route MUST remain
