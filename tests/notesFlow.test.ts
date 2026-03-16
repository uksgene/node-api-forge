// End-to-end notes flow test.
// Inputs: generated user + note payloads, auth token
// Outputs: status/schema assertions to validate API behavior.
import NotesService from "../services/notesService";
import { buildNote, buildUser } from "../testData/notesDataBuilder";
import Validator from "../core/responseValidator";
import successSchema from "../schemas/notesSuccess.schema.json";
import loginSchema from "../schemas/authLogin.schema.json";
import profileSchema from "../schemas/userProfile.schema.json";
import noteSchema from "../schemas/noteResponse.schema.json";
import notesListSchema from "../schemas/notesList.schema.json";

describe("Notes API Flow", () => {

    let user: { name: string; email: string; password: string };
    let note: { title: string; description: string; category: string };
    let token: string;
    let noteId: string;
    let loginResponse: { data: { token: string } };
    let createNoteResponse: { data: { id: string } };

    beforeAll(async () => {
        user = buildUser();
        note = buildNote();

        const register = await NotesService.registerUser(user);
        if ((register.body as { success?: boolean }).success === false) {
            throw new Error(`Register failed: ${JSON.stringify(register.body)}`);
        }

        const login = await NotesService.login({ email: user.email, password: user.password });
        loginResponse = login.body as { data: { token: string } };
        token = loginResponse.data.token;

        const createNote = await NotesService.createNote(token, note);
        createNoteResponse = createNote.body as { data: { id: string } };
        noteId = createNoteResponse.data.id;
    });

    test("Health Check", async () => {
        const res = await NotesService.healthCheck();
        Validator.validate(successSchema, res.body);
    });

    test("Register User", async () => {
        const res = await NotesService.registerUser(buildUser());
        Validator.validate(successSchema, res.body);
    });

    test("Login", async () => {
        Validator.validate(loginSchema, loginResponse);
    });

    test("Get Profile", async () => {
        const res = await NotesService.getProfile(token);
        Validator.validate(profileSchema, res.body);
    });

    test("Create Note", async () => {
        Validator.validate(noteSchema, createNoteResponse);
    });

    test("Get Notes", async () => {
        const res = await NotesService.getNotes(token);
        Validator.validate(notesListSchema, res.body);
        const found = (res.body as { data: Array<{ id: string }> }).data.some(
            (item) => item.id === noteId
        );
        expect(found).toBe(true);
    });

    test("Get Note By ID", async () => {
        const res = await NotesService.getNoteById(token, noteId);
        Validator.validate(noteSchema, res.body);
    });

    test("Update Note (PUT)", async () => {
        const res = await NotesService.updateNote(token, noteId, {
            ...note,
            completed: true
        });
        Validator.validate(noteSchema, res.body);
    });

    test("Update Note Status (PATCH)", async () => {
        const res = await NotesService.patchNote(token, noteId, { completed: false });
        Validator.validate(noteSchema, res.body);
    });

    test("Delete Note", async () => {
        const res = await NotesService.deleteNote(token, noteId);
        Validator.validate(successSchema, res.body);
    });

    test("Delete Account", async () => {
        const res = await NotesService.deleteAccount(token);
        Validator.validate(successSchema, res.body);
    });

    test("Logout", async () => {
        const res = await NotesService.logout(token);
        Validator.validate(successSchema, res.body);
    });

});
