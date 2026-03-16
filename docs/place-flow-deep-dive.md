# Place API Test Flow Deep Dive

This document explains each test flow in `tests/placeFlow.test.js` with full,
step-by-step detail. It traces control flow across modules, explains how each
tool works, and shows how data moves through the framework.

Last updated: 2026-03-16

---

## Overview: What Runs When You Execute the Tests

Running `npm test` triggers Jest, which loads `tests/placeFlow.test.js`.
The test file imports:

- `PlaceService` from `services/placeService.js`
- `buildPlace` from `testData/placeDataBuilder.js`
- `Validator` from `core/responseValidator.js`
- `schema` from `schemas/getPlace.schema.json`
- `retry` from `core/retryHandler.js`

Under the hood, `PlaceService` uses `ApiClient` which uses:

- `supertest` to perform HTTP-like calls
- `logger` to record each request/response
- `mockServer` when `NODE_ENV === "test"`

This means every test flow is built from layered components:
Test -> Service -> ApiClient -> Mock Handler (test) -> Response -> Assertions

---

## 1. Add Place Flow (Detailed Step-by-Step)

### Step 0: Test Initialization

1. Jest loads `tests/placeFlow.test.js`.
2. The `describe("Place API Flow")` block is evaluated.
3. `placeId` and `place` are declared for use across tests.

### Step 1: Build the Request Payload (`beforeAll`)

1. Jest runs `beforeAll`.
2. `buildPlace()` is called from `testData/placeDataBuilder.js`.
3. The builder creates:
   - A realistic `lat` and `lng` using `Math.random()`.
   - A readable `name` using a prefix + random suffix.
   - A mock `phone_number` in E.164-like format (`+1XXXXXXXXXX`).
   - A readable address and example website.
4. `buildPlace()` returns a plain JS object.
5. The object is stored in `place` for use by the test.

Why this matters:

- It removes the need for external dependencies like faker in the test runtime.
- It guarantees a well-shaped request for the API.

### Step 2: Add Place Test Starts

1. The `res` object returns to `placeFlow.test.js`.
2. The test asserts:
   - `res.status === 200`
3. It saves the returned `place_id` for later tests:
   ```
   placeId = res.body.place_id
   ```

At this point, the system has:

- A place stored in memory.
- A `placeId` that represents it.

---

## 2. Get Place Flow (Detailed Step-by-Step)

### Step 1: Test Starts

1. The test calls:
   ```
   const res = await retry(() => PlaceService.getPlace(placeId));
   ```
2. `retry` wraps the function call to allow up to 3 attempts.
3. If a failure happens, `retry` re-invokes `PlaceService.getPlace`.

### Step 2: PlaceService Builds the Request

1. `PlaceService.getPlace(placeId)` constructs:
   ```
   /maps/api/place/get/json?place_id=<placeId>&key=<API_KEY>
   ```
2. It calls `ApiClient.get` with this endpoint.

### Step 3: ApiClient Executes GET

1. `ApiClient.get` logs the outgoing request.
2. In test mode, it calls:
   ```
   handleMockRequest("GET", endpoint)
   ```

### Step 4: Mock Server Responds

1. `mockServer` sees:
   - Method: GET
   - Path: `/maps/api/place/get/json`
2. It parses `place_id` from the query string.
3. It looks up the payload stored earlier in `places`.
4. It returns:
   ```
   { status: 200, body: <stored place object> }
   ```

### Step 5: Response Validation

1. The response object is returned to the test.
2. The test calls:
   ```
   Validator.validate(schema, res.body)
   ```
3. `Validator`:
   - Instantiates AJV.
   - Compiles the schema.
   - Validates the response body.
4. If the schema does not match, it throws an error with validation details.

Result:

- This ensures the API contract is respected, not just status codes.

---

## 3. Update Place Flow (Detailed Step-by-Step)

### Step 1: Test Starts

1. The test calls:
   ```
   const res = await PlaceService.updatePlace(placeId, "Automation Street");
   ```
2. The goal is to update only the `address` for the existing place.

### Step 2: PlaceService Builds the Request

1. `PlaceService.updatePlace` constructs the endpoint:
   ```
   /maps/api/place/update/json
   ```
2. It builds the body:
   ```
   {
     place_id: <placeId>,
     address: "Automation Street",
     key: <API_KEY>
   }
   ```
3. This body is passed to `ApiClient.put`.

### Step 3: ApiClient Executes PUT

1. The request is logged.
2. In test mode, `handleMockRequest("PUT", endpoint, body)` is called.

### Step 4: Mock Server Updates the Record

1. `mockServer` identifies:
   - Method: PUT
   - Path: `/maps/api/place/update/json`
2. It extracts `place_id` from the body.
3. It checks the in-memory map for that ID.
4. If found, it updates only the `address` field.
5. It returns:
   ```
   { status: 200, body: { msg: "Address successfully updated" } }
   ```

### Step 5: Assertions

1. The test asserts:
   ```
   expect(res.status).toBe(200);
   ```

This verifies that the update call completed successfully.

---

## 4. Delete Place Flow (Detailed Step-by-Step)

### Step 1: Test Starts

1. The test calls:
   ```
   const res = await PlaceService.deletePlace(placeId);
   ```

### Step 2: PlaceService Builds the Request

1. `PlaceService.deletePlace` builds:
   ```
   /maps/api/place/delete/json?key=<API_KEY>
   ```
2. It prepares the body:
   ```
   { place_id: <placeId> }
   ```
3. This is sent via `ApiClient.post`.

### Step 3: ApiClient Executes DELETE (POST)

1. Logs the request.
2. In test mode, routes to:
   ```
   handleMockRequest("POST", endpoint, body)
   ```

### Step 4: Mock Server Deletes the Record

1. `mockServer` identifies:
   - Method: POST
   - Path: `/maps/api/place/delete/json`
2. It extracts `place_id` from the body.
3. It removes the entry from the map.
4. Returns:
   ```
   { status: 200, body: { status: "OK" } }
   ```

### Step 5: Assertions

1. The test asserts:
   ```
   expect(res.body.status).toBe("OK");
   ```

At this point:

- The in-memory store no longer contains the place.
- The full add -> get -> update -> delete cycle is complete.

---

## 5. Tool-by-Tool Summary (How Each Tool Helps)

### Jest

- Loads and runs all test files.
- Controls `beforeAll`, `describe`, `test` blocks.
- Generates reports and coverage.

### Supertest

- Abstracts HTTP calls for tests.
- Normally uses live HTTP, but we intercept with mock handler in test mode.

### Mock Handler (mockServer.js)

- Replaces external API calls in test mode.
- Makes local unit-like tests possible for API flow logic.

### AJV

- Enforces schema validation for responses.
- Ensures contract compliance, not just status checks.

### Winston Logger

- Captures detailed JSON logs for every request/response.
- Useful for debugging and CI artifact analysis.

---

## 6. In-Memory Flow Diagram (Single Sequence)

1. Test -> `PlaceService` -> `ApiClient`
2. `ApiClient` -> `mockServer` (test mode)
3. `mockServer` -> returns structured response
4. `ApiClient` -> returns to test
5. Test -> validates status + schema

---

## 7. What to Change If You Want Real HTTP Calls

Set `NODE_ENV` to something other than `test`. Then:

- `ApiClient` will call `supertest(baseURL)`.
- Requests go to the real API defined in `.env`.

This is useful in staging or pre-prod validations, while test mode remains fast
and deterministic for CI.
