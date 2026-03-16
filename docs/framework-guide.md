# Supertest Forge Framework Guide

This document explains how the repository is organized, how each module works,
how test flows run end-to-end, and why this framework is structured for scale.

Last updated: 2026-03-16

## 1. Folder Structure and Responsibilities

### config/
- Purpose: Centralized environment and runtime configuration.
- Key file: `env.js`
  - Loads `.env` and exports `baseURL` and `apiKey`.
  - All HTTP clients and services rely on this single source of truth.

### core/
Core building blocks used by services and tests.
- `apiClient.js`
  - Wraps HTTP calls (GET/POST/PUT).
  - Logs request/response details.
  - When `NODE_ENV === "test"`, routes calls to an in-memory mock handler to avoid external network dependency.
- `logger.js`
  - Winston logger with console + file outputs.
  - Writes JSON logs to `reports/api.log`.
- `responseValidator.js`
  - JSON schema validation via AJV.
  - Throws errors when API response shape does not match schema.
- `retryHandler.js`
  - Simple retry wrapper to re-run flaky requests (default 3 times).
- `mockServer.js`
  - In-memory mock for Place API endpoints used by tests.
  - Maintains a local `places` store and returns deterministic responses.

### services/
Service layer that models API endpoints as methods.
- `placeService.js`
  - `addPlace(body)` -> POST `/maps/api/place/add/json`
  - `getPlace(placeId)` -> GET `/maps/api/place/get/json`
  - `updatePlace(placeId, address)` -> PUT `/maps/api/place/update/json`
  - `deletePlace(placeId)` -> POST `/maps/api/place/delete/json`
  - Keeps tests from directly dealing with raw endpoint strings.

### schemas/
JSON schemas for response validation.
- `getPlace.schema.json`
  - Full response contract for "get place" response.

### testData/
Test data sources and builders.
- `placeDataBuilder.ts`
  - Generates realistic test data without external dependencies.
  - Avoids ESM-only faker during Jest runs.

### tests/
Runtime API flows.
- `placeFlow.test.js`
  - End-to-end flow: add -> get -> update -> delete.
  - Validates response against schema and checks status codes.

### contracts/
Contract testing (provider/consumer) configuration.
- `placeContract.test.js`
  - Example of Pact interaction definitions.
  - Lays groundwork for contract testing between services.

### utils/
Optional helpers.
- (No active utilities at the moment.)

### reports/
Output artifacts.
- `report.html` (Jest HTML report)
- `api.log` (Winston structured logs)

### coverage/
Coverage outputs from Jest.

---

## 2. Component-Level Explanation

### ApiClient (core/apiClient.js)
- Acts as the single HTTP entrypoint for the framework.
- Responsibilities:
  - Accept endpoint + payload.
  - Log requests and responses in a consistent JSON format.
  - Route calls to:
    - External API (normal mode).
    - Local mock handler (test mode).
- This separation keeps tests stable and avoids network flakiness.

### Mock Server (core/mockServer.js)
- Pure in-memory implementation of required endpoints.
- Uses a `Map` to store places added during a test run.
- Endpoints:
  - Add Place: stores payload, returns a synthetic `place_id`.
  - Get Place: returns stored payload.
  - Update Place: updates only the `address`.
  - Delete Place: removes the place, returns OK.

### Place Service (services/placeService.js)
- Defines the API surface in one place.
- Centralizes URLs and query params.
- Keeps tests simple and readable:
  - Tests call `PlaceService.addPlace` rather than raw URLs.

### Schema Validator (core/responseValidator.js)
- Uses AJV to validate JSON response structure.
- Ensures responses match required properties and data types.
- Fail-fast approach: a schema mismatch fails the test with clear errors.

### Retry Handler (core/retryHandler.js)
- Wraps async calls and retries on failure.
- Useful for flaky or eventual-consistency APIs.

### Logger (core/logger.js)
- Standardized logging with timestamps.
- JSON format makes it easy to parse in CI and log aggregators.

---

## 3. Algorithm of Each Test Flow (Detailed Call Path)

### Test: `Place API Flow` (tests/placeFlow.test.js)

#### Step 1: Build Request Data
1. `beforeAll` calls `buildPlace()` from `testData/placeDataBuilder.js`.
2. `buildPlace()` creates realistic values (lat/lng, name, phone, address).
3. The resulting object is stored as `place`.

#### Step 2: Add Place
1. Test calls `PlaceService.addPlace(place)`.
2. `PlaceService.addPlace` constructs endpoint URL and forwards to `ApiClient.post`.
3. `ApiClient.post`:
   - Logs the request.
   - If `NODE_ENV === "test"`, routes to `mockServer.handleMockRequest`.
   - Otherwise uses `supertest(baseURL)` to hit external API.
4. The response returns `{ status: "OK", place_id }`.
5. Test stores `placeId = res.body.place_id`.

#### Step 3: Get Place
1. Test calls `retry(() => PlaceService.getPlace(placeId))`.
2. `retryHandler` attempts the call up to 3 times.
3. `PlaceService.getPlace` builds endpoint and calls `ApiClient.get`.
4. `ApiClient.get` fetches data from mock server or external API.
5. Response is validated:
   - `Validator.validate(schema, res.body)`
   - If required fields are missing, test fails with AJV error.

#### Step 4: Update Place
1. Test calls `PlaceService.updatePlace(placeId, "Automation Street")`.
2. `PlaceService.updatePlace` sends `place_id`, new `address`, and `apiKey`.
3. `ApiClient.put` sends the payload.
4. Test asserts `res.status === 200`.

#### Step 5: Delete Place
1. Test calls `PlaceService.deletePlace(placeId)`.
2. `PlaceService.deletePlace` sends `place_id` via POST.
3. `ApiClient.post` executes the delete call.
4. Test asserts `res.body.status === "OK"`.

---

## 4. Framework Description: Modules and Tooling

### Framework Modules
- Core HTTP Engine (`core/apiClient.js`): single transport layer.
- Service Layer (`services/`): endpoint-specific logic.
- Data Layer (`testData/`): static and dynamic payloads.
- Validation Layer (`schemas/` + `core/responseValidator.js`): strict response shape enforcement.
- Execution Layer (`tests/`): test flows and assertions.
- Contract Layer (`contracts/`): API expectations with Pact.

### Tooling
- Jest: test runner and coverage generation.
- Supertest: HTTP request abstraction.
- AJV: JSON schema validation.
- Winston: structured logging.
- Dotenv: environment configuration.
- Pact: contract test scaffolding.

---

## 5. Why This Is Enterprise-Grade

This framework has several enterprise-grade characteristics:
- **Separation of concerns**: transport, services, test data, and validation are cleanly separated.
- **Schema validation**: responses are verified against strict contracts, preventing silent failures.
- **Structured logging**: JSON logs enable indexing and tracing in production CI pipelines.
- **Contract testing**: Pact provides a formal place to define consumer/provider agreements.
- **Config-driven**: `.env` controls endpoints and API keys without code changes.
- **Deterministic tests**: mock handler avoids external network dependency in test runs.

Enterprise-grade also depends on how it is used in CI/CD (gates, reporting, and monitoring),
but the architecture here is ready for those workflows.

---

## 6. How It Is Scalable

Scalability comes from design patterns already in place:
- **Service layer expansion**: new endpoints are added by creating new service methods.
- **Schema-first validation**: each endpoint can have a schema file to enforce response shape.
- **Reusable builders**: data generators and request builders keep test creation consistent.
- **Modular tests**: flows can be extended or split without rewriting core logic.
- **Mock-first local runs**: quick feedback loops without external dependencies.

When the project grows, you can add:
- More services per domain (e.g., `userService`, `orderService`).
- More schemas and contract tests.
- Environment profiles for staging, QA, production.
- CI parallelization across test suites.

---

## 7. End-to-End Flow Summary (One-Liner)

Test -> Service -> ApiClient -> (Mock Handler in test) -> Response -> Schema Validation -> Assertions.
