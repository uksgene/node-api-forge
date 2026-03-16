// Notes API payload builder for tests.
// Inputs: none (uses random generation internally)
// Outputs: user and note request bodies used in NotesService tests.
const randomString = (prefix: string) => {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${suffix}`;
};

export const buildUser = () => {
    const email = `${randomString("user")}@example.com`;
    return {
        name: "Notes User",
        email,
        password: "Password123!"
    };
};

export const buildNote = () => {
    return {
        title: "Practice Notes API",
        description: "Create, update, and delete a note",
        category: "Home"
    };
};
