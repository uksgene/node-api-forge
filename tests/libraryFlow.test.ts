import LibraryService from "../services/libraryService";
import buildBook from "../testData/libraryDataBuilder";
import Validator from "../core/responseValidator";
import authorSchema from "../schemas/libraryGetByAuthor.schema.json";
import idSchema from "../schemas/libraryGetById.schema.json";

describe("Library API Flow", () => {

    let book: { name: string; isbn: string; aisle: string; author: string };
    let bookId: string;

    beforeAll(() => {
        book = buildBook();
    });

    test("Add Book", async () => {
        const res = await LibraryService.addBook(book);
        const body = res.body as { Msg: string; ID: string };

        expect(res.status).toBe(200);
        expect(body.Msg).toBe("successfully added");

        bookId = body.ID;
    });

    test("Get Books By Author", async () => {
        const res = await LibraryService.getBooksByAuthor(book.author);

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
        const body = res.body as { book_name: string };

        Validator.validate(idSchema, res.body);

        expect(body.book_name).toBe(book.name);
    });

    test("Delete Book", async () => {
        const res = await LibraryService.deleteBook(bookId);
        const body = res.body as { msg: string };

        expect(body.msg).toBe("book is successfully deleted");
    });

});
