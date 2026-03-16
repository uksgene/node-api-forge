const LibraryService = require("../services/libraryService");
const buildBook = require("../testData/libraryDataBuilder");
const Validator = require("../core/responseValidator");
const authorSchema = require("../schemas/libraryGetByAuthor.schema.json");
const idSchema = require("../schemas/libraryGetById.schema.json");

describe("Library API Flow", () => {

    let book;
    let bookId;

    beforeAll(() => {
        book = buildBook();
    });

    test("Add Book", async () => {
        const res = await LibraryService.addBook(book);

        expect(res.status).toBe(200);
        expect(res.body.Msg).toBe("successfully added");

        bookId = res.body.ID;
    });

    test("Get Books By Author", async () => {
        const res = await LibraryService.getBooksByAuthor(book.author);

        Validator.validate(authorSchema, res.body);

        const found = res.body.some(
            (item) =>
                item.Isbn === book.isbn &&
                String(item.Aisle) === String(book.aisle)
        );
        expect(found).toBe(true);
    });

    test("Get Book By ID", async () => {
        const res = await LibraryService.getBookById(bookId);

        Validator.validate(idSchema, res.body);

        expect(res.body.book_name).toBe(book.name);
    });

    test("Delete Book", async () => {
        const res = await LibraryService.deleteBook(bookId);

        expect(res.body.msg).toBe("book is successfully deleted");
    });

});
