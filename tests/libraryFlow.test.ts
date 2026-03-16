// End-to-end library flow test.
// Inputs: generated book payload + bookId chaining
// Outputs: status/schema assertions to validate API behavior.
import LibraryService from "../services/libraryService";
import buildBook from "../testData/libraryDataBuilder";
import Validator from "../core/responseValidator";
import authorSchema from "../schemas/libraryGetByAuthor.schema.json";
import idSchema from "../schemas/libraryGetById.schema.json";

describe("Library API Flow", () => {

    let book: { name: string; isbn: string; aisle: string; author: string };
    let bookId: string;
    let addBookResponse: { Msg: string; ID: string };

    beforeAll(async () => {
        book = buildBook();
        const res = await LibraryService.addBook(book);
        addBookResponse = res.body as { Msg: string; ID: string };
        bookId = addBookResponse.ID;
    });

    test("Add Book", async () => {
        expect(addBookResponse.Msg).toBe("successfully added");
        expect(typeof addBookResponse.ID).toBe("string");
    });

    test("Get Books By Author", async () => {
        const res = await LibraryService.getBooksByAuthor(book.author);

        if (!Array.isArray(res.body)) {
            throw new Error(
                `Get Books By Author returned non-array response. Response: ${JSON.stringify(res.body)}`
            );
        }
        Validator.validate(authorSchema, res.body);

        const found = (res.body as Array<{ Isbn: string; Aisle: number }>).some(
            (item) =>
                item.Isbn === book.isbn &&
                String(item.Aisle) === String(book.aisle)
        );
        expect(found).toBe(true);
    });

    test("Get Book By ID", async () => {
        const res = await LibraryService.getBookById(bookId);
        if (res.body === null || typeof res.body !== "object" || Array.isArray(res.body)) {
            throw new Error(
                `Get Book By ID returned non-object response. Response: ${JSON.stringify(res.body)}`
            );
        }
        if ((res.body as { msg?: string }).msg === "book not found") {
            throw new Error(
                `Get Book By ID returned 'book not found' for ID ${bookId}. Response: ${JSON.stringify(res.body)}`
            );
        }
        const body = res.body as { book_name: string };

        Validator.validate(idSchema, res.body);

        expect(body.book_name).toBe(book.name);
    });

    /*
    test("Delete Book", async () => {
        const res = await LibraryService.deleteBook(bookId);
        const body = res.body as { msg: string };

        expect(body.msg).toBe("book is successfully deleted");
    });
*/
});
