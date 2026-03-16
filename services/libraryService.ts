// Library API service wrapper for test flows.
// Inputs: book payloads or identifiers
// Outputs: ApiClient responses consumed by test assertions/validators.
import ApiClient from "../core/apiClient";

class LibraryService {

    static addBook(body: { name: string; isbn: string; aisle: string; author: string }) {
        return ApiClient.post("/Library/Addbook.php", body);
    }

    static getBooksByAuthor(authorName: string) {
        return ApiClient.get(`/Library/GetBook.php?AuthorName=${authorName}`);
    }

    static getBookById(id: string) {
        return ApiClient.get(`/Library/GetBook.php?ID=${id}`);
    }

    static deleteBook(id: string) {
        return ApiClient.post("/Library/DeleteBook.php", { ID: id });
    }

}

export default LibraryService;
