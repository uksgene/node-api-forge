// Library API service wrapper for test flows.
const ApiClient = require("../core/apiClient");

class LibraryService {

    static addBook(body) {
        return ApiClient.post("/Library/Addbook.php", body);
    }

    static getBooksByAuthor(authorName) {
        return ApiClient.get(`/Library/GetBook.php?AuthorName=${authorName}`);
    }

    static getBookById(id) {
        return ApiClient.get(`/Library/GetBook.php?ID=${id}`);
    }

    static deleteBook(id) {
        return ApiClient.post("/Library/DeleteBook.php", { ID: id });
    }

}

module.exports = LibraryService;
