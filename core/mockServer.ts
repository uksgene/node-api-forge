// In-memory mock for Place + Library + Notes APIs, used only in test mode.
// Inputs: method + endpoint + body + headers (from ApiClient/NotesApiClient)
// Outputs: { status, body } shaped like the real API responses for tests.
import { randomUUID } from "crypto";
import { URL } from "url";

// Minimal in-memory mock of the Places and Library APIs used by tests.
// This keeps tests offline and deterministic without external network calls.
const places = new Map<string, Record<string, unknown>>();
const books = new Map<string, { name: string; isbn: string; aisle: string; author: string }>();
const users = new Map<string, { id: string; name: string; email: string; password: string }>();
const tokens = new Map<string, string>();
const notes = new Map<string, Record<string, unknown>>();

function response<T>(statusCode: number, payload: T) {
    return { status: statusCode, body: payload };
}

async function handleMockRequest(
    method: string,
    endpoint: string,
    body: Record<string, unknown> = {},
    headers: Record<string, string> = {}
) {
    const url = new URL(endpoint, "http://localhost");
    const path = url.pathname;
    const normalizedHeaders = Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
    );
    const authToken = normalizedHeaders["x-auth-token"];
    const userId = authToken ? tokens.get(authToken) : undefined;

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

    if (method === "GET" && path === "/notes/api/health-check") {
        return response(200, { success: true, status: 200, message: "Notes API is running" });
    }

    if (method === "POST" && path === "/notes/api/users/register") {
        const payload = body as { name: string; email: string; password: string };
        const existing = Array.from(users.values()).find((u) => u.email === payload.email);
        if (existing) {
            return response(400, { success: false, status: 400, message: "Email already exists" });
        }
        const id = randomUUID();
        users.set(id, { id, name: payload.name, email: payload.email, password: payload.password });
        return response(201, {
            success: true,
            status: 201,
            message: "User account created successfully",
            data: { id, name: payload.name, email: payload.email }
        });
    }

    if (method === "POST" && path === "/notes/api/users/login") {
        const payload = body as { email: string; password: string };
        const user = Array.from(users.values()).find(
            (u) => u.email === payload.email && u.password === payload.password
        );
        if (!user) {
            return response(401, { success: false, status: 401, message: "Invalid credentials" });
        }
        const token = randomUUID();
        tokens.set(token, user.id);
        return response(200, {
            success: true,
            status: 200,
            message: "Login successful",
            data: { id: user.id, name: user.name, email: user.email, token }
        });
    }

    if (method === "GET" && path === "/notes/api/users/profile") {
        if (!userId || !users.has(userId)) {
            return response(401, { success: false, status: 401, message: "Unauthorized" });
        }
        const user = users.get(userId)!;
        return response(200, {
            success: true,
            status: 200,
            message: "Profile retrieved",
            data: { id: user.id, name: user.name, email: user.email }
        });
    }

    if (method === "PATCH" && path === "/notes/api/users/profile") {
        if (!userId || !users.has(userId)) {
            return response(401, { success: false, status: 401, message: "Unauthorized" });
        }
        const user = users.get(userId)!;
        const payload = body as { name?: string; email?: string };
        const updated = { ...user, ...payload };
        users.set(userId, updated);
        return response(200, {
            success: true,
            status: 200,
            message: "Profile updated",
            data: { id: updated.id, name: updated.name, email: updated.email }
        });
    }

    if (method === "POST" && path === "/notes/api/users/forgot-password") {
        return response(200, { success: true, status: 200, message: "Reset link sent" });
    }

    if (method === "POST" && path === "/notes/api/users/verify-reset-password-token") {
        return response(200, { success: true, status: 200, message: "Token valid" });
    }

    if (method === "POST" && path === "/notes/api/users/reset-password") {
        return response(200, { success: true, status: 200, message: "Password reset" });
    }

    if (method === "POST" && path === "/notes/api/users/change-password") {
        if (!userId || !users.has(userId)) {
            return response(401, { success: false, status: 401, message: "Unauthorized" });
        }
        const payload = body as { currentPassword: string; newPassword: string };
        const user = users.get(userId)!;
        if (user.password !== payload.currentPassword) {
            return response(400, { success: false, status: 400, message: "Incorrect password" });
        }
        users.set(userId, { ...user, password: payload.newPassword });
        return response(200, { success: true, status: 200, message: "Password updated" });
    }

    if (method === "DELETE" && path === "/notes/api/users/logout") {
        if (authToken) {
            tokens.delete(authToken);
        }
        return response(200, { success: true, status: 200, message: "Logged out" });
    }

    if (method === "DELETE" && path === "/notes/api/users/delete-account") {
        if (!userId || !users.has(userId)) {
            return response(401, { success: false, status: 401, message: "Unauthorized" });
        }
        users.delete(userId);
        for (const [token, uid] of tokens.entries()) {
            if (uid === userId) tokens.delete(token);
        }
        for (const [noteId, note] of notes.entries()) {
            if (note.user_id === userId) notes.delete(noteId);
        }
        return response(200, { success: true, status: 200, message: "Account deleted" });
    }

    if (path === "/notes/api/notes") {
        if (!userId || !users.has(userId)) {
            return response(401, { success: false, status: 401, message: "Unauthorized" });
        }
        if (method === "POST") {
            const payload = body as { title: string; description: string; category: string };
            const id = randomUUID();
            const now = new Date().toISOString();
            const note = {
                id,
                title: payload.title,
                description: payload.description,
                completed: false,
                created_at: now,
                updated_at: now,
                category: payload.category,
                user_id: userId
            };
            notes.set(id, note);
            return response(200, {
                success: true,
                status: 200,
                message: "Note successfully created",
                data: note
            });
        }
        if (method === "GET") {
            const data = Array.from(notes.values()).filter((n) => n.user_id === userId);
            return response(200, {
                success: true,
                status: 200,
                message: "Notes retrieved",
                data
            });
        }
    }

    if (path.startsWith("/notes/api/notes/")) {
        if (!userId || !users.has(userId)) {
            return response(401, { success: false, status: 401, message: "Unauthorized" });
        }
        const id = path.split("/").pop() || "";
        const note = notes.get(id);
        if (!note) {
            return response(404, { success: false, status: 404, message: "Note not found" });
        }
        if (method === "GET") {
            return response(200, {
                success: true,
                status: 200,
                message: "Note retrieved",
                data: note
            });
        }
        if (method === "PUT") {
            const payload = body as {
                title: string;
                description: string;
                completed: boolean;
                category: string;
            };
            const updated = {
                ...note,
                title: payload.title,
                description: payload.description,
                completed: payload.completed,
                category: payload.category,
                updated_at: new Date().toISOString()
            };
            notes.set(id, updated);
            return response(200, {
                success: true,
                status: 200,
                message: "Note updated",
                data: updated
            });
        }
        if (method === "PATCH") {
            const payload = body as { completed: boolean };
            const updated = { ...note, completed: payload.completed, updated_at: new Date().toISOString() };
            notes.set(id, updated);
            return response(200, {
                success: true,
                status: 200,
                message: "Note updated",
                data: updated
            });
        }
        if (method === "DELETE") {
            notes.delete(id);
            return response(200, { success: true, status: 200, message: "Note deleted" });
        }
    }

    return response(404, { status: "NOT_FOUND" });
}

export default handleMockRequest;
