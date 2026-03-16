// Library payload builder for tests.
// Inputs: optional customBook.json (partial or full payload)
// Outputs: book request body used by LibraryService.addBook in tests.
// Builder for Library API payloads without external dependencies.
import fs from "fs";
import path from "path";

type BookPayload = {
    name: string;
    isbn: string;
    aisle: string;
    author: string;
};

const CUSTOM_PATH = path.join(__dirname, "customBook.jsonc");

const stripJsonComments = (input: string) => {
    return input
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
};

function buildBook() {
    const randomString = (prefix: string) => {
        const suffix = Math.random().toString(36).slice(2, 6);
        return `${prefix}${suffix}`;
    };

    const isbn = randomString("bk");
    const aisle = String(Math.floor(100 + Math.random() * 900));

    const defaultBook: BookPayload = {
        name: "Learn API Testing with Node",
        isbn,
        aisle,
        author: "John foe"
    };

    if (fs.existsSync(CUSTOM_PATH)) {
        try {
            const raw = fs.readFileSync(CUSTOM_PATH, "utf-8").trim();
            if (raw) {
                const custom = JSON.parse(stripJsonComments(raw)) as Partial<BookPayload>;
                return { ...defaultBook, ...custom };
            }
        } catch {
            return defaultBook;
        }
    }

    return defaultBook;
}

export default buildBook;
