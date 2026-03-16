# Library API Test Flow Deep Dive

This document explains each Library API test in `tests/libraryFlow.test.js`
with full, step-by-step detail. It traces control flow across modules,
explains how each tool works, and shows how data moves through the framework.

Last updated: 2026-03-16

---

## Overview: What Runs When You Execute the Tests

Running `npm test` triggers Jest, which loads `tests/libraryFlow.test.js`.
The test file imports:
- `LibraryService` from `services/libraryService.js`
- `buildBook` from `testData/libraryDataBuilder.js`
- `Validator` from `core/responseValidator.js`
- `authorSchema` from `schemas/libraryGetByAuthor.schema.json`
- `idSchema` from `schemas/libraryGetById.schema.json`

Under the hood, `LibraryService` uses `ApiClient` which uses:
- `supertest` to perform HTTP-like calls
- `logger` to record each request/response
- `mockServer` when `NODE_ENV === "test"`

The call stack is consistent:
Test -> Service -> ApiClient -> Mock Handler (test) -> Response -> Assertions

---

## 1. Add Book Flow (Detailed Step-by-Step)

### Step 0: Test Initialization
1. Jest loads `tests/libraryFlow.test.js`.
2. The `describe("Library API Flow")` block is evaluated.
3. `book` and `bookId` are declared for use across tests.

### Step 1: Build the Request Payload (`beforeAll`)
1. Jest runs `beforeAll`.
2. `buildBook()` is called from `testData/libraryDataBuilder.js`.
3. The builder creates:
   - `name`: a readable book name.
   - `isbn`: a short random string like `bk12`.
   - `aisle`: a numeric string (e.g., `"345"`).
   - `author`: `"John foe"`.
4. `buildBook()` returns a plain JS object.
5. The object is stored in `book`.

Why this matters:
- The test doesn’t depend on static JSON files.
- Each test run gets a unique ISBN/aisle to prevent collisions.

### Step 2: Add Book Test Starts
1. The test calls:
   ```
   const res = await LibraryService.addBook(book);
   ```
2. `LibraryService.addBook` builds the endpoint:
   ```
   /Library/Addbook.php
   ```
3. It forwards the body to `ApiClient.post`.

### Step 3: ApiClient Executes the Request
1. `ApiClient.post` logs the outgoing request.
2. It detects `NODE_ENV === "test"` and routes to the mock handler.
3. Instead of real HTTP, it calls:
   ```
   handleMockRequest("POST", endpoint, body)
   ```

### Step 4: Mock Server Processes the Request
1. `mockServer` sees:
   - Method: POST
   - Path: `/Library/Addbook.php`
2. It constructs an `ID` from `isbn + aisle`.
3. Stores the book payload in the in-memory `books` map:
   ```
   books.set(ID, payload)
   ```
4. Returns:
   ```
   { Msg: "successfully added", ID }
   ```

### Step 5: Back to the Test
1. The response is returned to the test.
2. Assertions confirm:
   - `res.status === 200`
   - `res.body.Msg === "successfully added"`
3. The test saves:
   ```
   bookId = res.body.ID
   ```

At this point:
- The book exists in memory.
- `bookId` is available for the rest of the flow.

---

## 2. Get Books By Author Flow (Detailed Step-by-Step)

### Step 1: Test Starts
1. The test calls:
   ```
   const res = await LibraryService.getBooksByAuthor(book.author);
   ```

### Step 2: Service Builds the Request
1. `LibraryService.getBooksByAuthor` creates:
   ```
   /Library/GetBook.php?AuthorName=John foe
   ```
2. This is passed to `ApiClient.get`.

### Step 3: ApiClient Executes GET
1. Logs the outgoing GET request.
2. In test mode, routes to:
   ```
   handleMockRequest("GET", endpoint)
   ```

### Step 4: Mock Server Responds
1. `mockServer` sees:
   - Method: GET
   - Path: `/Library/GetBook.php`
   - Query: `AuthorName`
2. It filters the `books` map:
   - Keeps any book where `book.author === AuthorName`.
3. It maps each to:
   ```
   { Name, Isbn, Aisle }
   ```
4. Returns an array of those results.

### Step 5: Validation and Assertions
1. The test validates:
   ```
   Validator.validate(authorSchema, res.body)
   ```
2. It checks that the book created earlier is present.
3. Assertions confirm:
   - The response is an array.
   - It contains the same ISBN and aisle.

---

## 3. Get Book By ID Flow (Detailed Step-by-Step)

### Step 1: Test Starts
1. The test calls:
   ```
   const res = await LibraryService.getBookById(bookId);
   ```

### Step 2: Service Builds the Request
1. `LibraryService.getBookById` creates:
   ```
   /Library/GetBook.php?ID=<bookId>
   ```
2. The endpoint is passed to `ApiClient.get`.

### Step 3: ApiClient Executes GET
1. Logs the request.
2. Routes to `handleMockRequest("GET", endpoint)` in test mode.

### Step 4: Mock Server Responds
1. `mockServer` checks `ID` query parameter.
2. If found in `books`, it returns:
   ```
   {
     book_name: <name>,
     isbn: <isbn>,
     aisle: <aisle>
   }
   ```

### Step 5: Validation and Assertions
1. The test runs:
   ```
   Validator.validate(idSchema, res.body)
   ```
2. Then asserts:
   ```
   expect(res.body.book_name).toBe(book.name)
   ```

This confirms the ID lookup returns the correct record.

---

## 4. Delete Book Flow (Detailed Step-by-Step)

### Step 1: Test Starts
1. The test calls:
   ```
   const res = await LibraryService.deleteBook(bookId);
   ```

### Step 2: Service Builds the Request
1. `LibraryService.deleteBook` constructs:
   ```
   /Library/DeleteBook.php
   ```
2. It posts:
   ```
   { ID: <bookId> }
   ```
3. This is passed to `ApiClient.post`.

### Step 3: ApiClient Executes POST
1. Logs the request.
2. Routes to `handleMockRequest("POST", endpoint, body)` in test mode.

### Step 4: Mock Server Deletes the Record
1. `mockServer` extracts `ID`.
2. Deletes the entry from the `books` map.
3. Returns:
   ```
   { msg: "book is successfully deleted" }
   ```

### Step 5: Assertions
1. The test asserts:
   ```
   expect(res.body.msg).toBe("book is successfully deleted")
   ```

At this point:
- The book no longer exists in the in-memory store.
- The add -> get -> delete lifecycle is complete.

---

## 5. Tool-by-Tool Summary (How Each Tool Helps)

### Jest
- Orchestrates test execution and lifecycle.
- Runs `beforeAll`, `test`, and assertion steps.

### Supertest
- Abstracts HTTP calls in tests.
- In test mode, ApiClient bypasses real HTTP.

### Mock Handler (mockServer.js)
- Simulates Library API endpoints locally.
- Keeps tests fast and deterministic.

### AJV (via Validator)
- Enforces schema correctness for responses.
- Prevents silent contract drift.

### Winston Logger
- Emits structured JSON logs to console and `reports/api.log`.
- Useful for debugging and audit trails.

---

## 6. End-to-End Flow Summary (One-Liner)

Test -> LibraryService -> ApiClient -> Mock Handler -> Response -> Schema Validation -> Assertions.
