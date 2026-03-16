// Notes API service wrapper for test flows.
// Inputs: domain values (user data, note data, token)
// Outputs: NotesApiClient responses consumed by tests.
// Note: endpoints include /notes/api basePath from the Swagger spec.
import NotesApiClient from "../core/notesApiClient";

class NotesService {

    static healthCheck() {
        return NotesApiClient.get("/notes/api/health-check");
    }

    static registerUser(body: { name: string; email: string; password: string }) {
        return NotesApiClient.postForm("/notes/api/users/register", body);
    }

    static login(body: { email: string; password: string }) {
        return NotesApiClient.postForm("/notes/api/users/login", body);
    }

    static getProfile(token: string) {
        return NotesApiClient.get("/notes/api/users/profile", token);
    }

    static updateProfile(token: string, body: { name?: string; email?: string }) {
        return NotesApiClient.patchForm("/notes/api/users/profile", body, token);
    }

    static forgotPassword(body: { email: string }) {
        return NotesApiClient.postForm("/notes/api/users/forgot-password", body);
    }

    static verifyResetToken(body: { token: string }) {
        return NotesApiClient.postForm("/notes/api/users/verify-reset-password-token", body);
    }

    static resetPassword(body: { token: string; newPassword: string }) {
        return NotesApiClient.postForm("/notes/api/users/reset-password", body);
    }

    static changePassword(token: string, body: { currentPassword: string; newPassword: string }) {
        return NotesApiClient.postForm("/notes/api/users/change-password", body, token);
    }

    static logout(token: string) {
        return NotesApiClient.delete("/notes/api/users/logout", token);
    }

    static deleteAccount(token: string) {
        return NotesApiClient.delete("/notes/api/users/delete-account", token);
    }

    static createNote(
        token: string,
        body: { title: string; description: string; category: string }
    ) {
        return NotesApiClient.postForm("/notes/api/notes", body, token);
    }

    static getNotes(token: string) {
        return NotesApiClient.get("/notes/api/notes", token);
    }

    static getNoteById(token: string, id: string) {
        return NotesApiClient.get(`/notes/api/notes/${id}`, token);
    }

    static updateNote(
        token: string,
        id: string,
        body: { title: string; description: string; completed: boolean; category: string }
    ) {
        return NotesApiClient.putForm(`/notes/api/notes/${id}`, body, token);
    }

    static patchNote(token: string, id: string, body: { completed: boolean }) {
        return NotesApiClient.patchForm(`/notes/api/notes/${id}`, body, token);
    }

    static deleteNote(token: string, id: string) {
        return NotesApiClient.delete(`/notes/api/notes/${id}`, token);
    }

}

export default NotesService;
