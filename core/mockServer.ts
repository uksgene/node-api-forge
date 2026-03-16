// In-memory mock for Place + Library APIs, used only in test mode.
// Inputs: method + endpoint + body (from ApiClient)
// Outputs: { status, body } shaped like the real API responses for tests.
import { randomUUID } from "crypto";
import { URL } from "url";

// Minimal in-memory mock of the Places and Library APIs used by tests.
// This keeps tests offline and deterministic without external network calls.
const places = new Map<string, Record<string, unknown>>();
const books = new Map<string, { name: string; isbn: string; aisle: string; author: string }>();

function response<T>(statusCode: number, payload: T) {
    return { status: statusCode, body: payload };
}

async function handleMockRequest(
    method: string,
    endpoint: string,
    body: Record<string, unknown> = {}
) {
    const url = new URL(endpoint, "http://localhost");
    const path = url.pathname;

    if (method === "POST" && path === "/maps/api/place/add/json") {
        const payload = body || {};
        const placeId = randomUUID();
        places.set(placeId, payload);
        return response(200, { status: "OK", place_id: placeId, scope: "APP" });
    }

    if (method === "GET" && path === "/maps/api/place/get/json") {
        const placeId = url.searchParams.get("place_id");
        if (!placeId || !places.has(placeId)) {
            return response(404, { status: "NOT_FOUND" });
        }
        return response(200, places.get(placeId));
    }

    if (method === "PUT" && path === "/maps/api/place/update/json") {
        const placeId = typeof body.place_id === "string" ? body.place_id : "";
        if (placeId && places.has(placeId)) {
            const existing = places.get(placeId) || {};
            places.set(placeId, { ...existing, address: body.address });
        }
        return response(200, { msg: "Address successfully updated" });
    }

    if (method === "POST" && path === "/maps/api/place/delete/json") {
        const placeId = typeof body.place_id === "string" ? body.place_id : "";
        if (placeId) {
            places.delete(placeId);
        }
        return response(200, { status: "OK" });
    }

    if (method === "POST" && path === "/Library/Addbook.php") {
        const payload = body as { name: string; isbn: string; aisle: string; author: string };
        const id = `${payload.isbn}${payload.aisle}`;
        books.set(id, payload);
        return response(200, { Msg: "successfully added", ID: id });
    }

    if (method === "GET" && path === "/Library/GetBook.php") {
        const authorName = url.searchParams.get("AuthorName");
        if (authorName) {
            const results = [];
            for (const book of books.values()) {
                if (book.author === authorName) {
                    results.push({
                        Name: book.name,
                        Isbn: book.isbn,
                        Aisle: Number(book.aisle)
                    });
                }
            }
            return response(200, results);
        }

        const id = url.searchParams.get("ID");
        if (!id || !books.has(id)) {
            return response(404, { msg: "book not found" });
        }
        const book = books.get(id);
        if (!book) {
            return response(404, { msg: "book not found" });
        }
        return response(200, {
            book_name: book.name,
            isbn: book.isbn,
            aisle: book.aisle
        });
    }

    if (method === "POST" && path === "/Library/DeleteBook.php") {
        const id = typeof body.ID === "string" ? body.ID : "";
        if (id) {
            books.delete(id);
        }
        return response(200, { msg: "book is successfully deleted" });
    }

    return response(404, { status: "NOT_FOUND" });
}

export default handleMockRequest;
