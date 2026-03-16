// Consumer-driven contract tests for Library API.
// Inputs: request definitions + expected responses
// Outputs: Pact files in reports/pacts when PACT_ENABLED=true.
import path from "path";
import axios from "axios";
import { PactV3 } from "@pact-foundation/pact";

const pactEnabled = process.env.PACT_ENABLED === "true";

(pactEnabled ? describe : describe.skip)("Library API Contract", () => {

    const provider = new PactV3({
        dir: path.resolve(process.cwd(), "reports/pacts"),
        consumer: "LibraryConsumer",
        provider: "LibraryProvider"
    });

    test("Add Book contract", () => {
        provider
            .given("provider accepts new book")
            .uponReceiving("a request to add a book")
            .withRequest({
                method: "POST",
                path: "/Library/Addbook.php",
                headers: { "Content-Type": "application/json" },
                body: {
                    name: "Learn API Testing with Node",
                    isbn: "bk12",
                    aisle: "345",
                    author: "John foe"
                }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: { Msg: "successfully added", ID: "bk12345" }
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.post(
                `${mockserver.url}/Library/Addbook.php`,
                {
                    name: "Learn API Testing with Node",
                    isbn: "bk12",
                    aisle: "345",
                    author: "John foe"
                },
                { headers: { "Content-Type": "application/json" } }
            );

            expect(res.status).toBe(200);
            expect(res.data.Msg).toBe("successfully added");
        });
    });

    test("Get Books By Author contract", () => {
        provider
            .given("books exist for author")
            .uponReceiving("a request to list books by author")
            .withRequest({
                method: "GET",
                path: "/Library/GetBook.php",
                query: { AuthorName: "John foe" }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: [
                    { Name: "Learn API Testing with Node", Isbn: "bk12", Aisle: 345 }
                ]
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.get(
                `${mockserver.url}/Library/GetBook.php?AuthorName=John%20foe`
            );

            expect(res.status).toBe(200);
            expect(res.data[0].Name).toBe("Learn API Testing with Node");
        });
    });

    test("Get Book By ID contract", () => {
        provider
            .given("book exists")
            .uponReceiving("a request to get a book by id")
            .withRequest({
                method: "GET",
                path: "/Library/GetBook.php",
                query: { ID: "bk12345" }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: {
                    book_name: "Learn API Testing with Node",
                    isbn: "bk12",
                    aisle: "345"
                }
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.get(
                `${mockserver.url}/Library/GetBook.php?ID=bk12345`
            );

            expect(res.status).toBe(200);
            expect(res.data.book_name).toBe("Learn API Testing with Node");
        });
    });

    test("Delete Book contract", () => {
        provider
            .given("book exists and can be deleted")
            .uponReceiving("a request to delete a book")
            .withRequest({
                method: "POST",
                path: "/Library/DeleteBook.php",
                headers: { "Content-Type": "application/json" },
                body: { ID: "bk12345" }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: { msg: "book is successfully deleted" }
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.post(
                `${mockserver.url}/Library/DeleteBook.php`,
                { ID: "bk12345" },
                { headers: { "Content-Type": "application/json" } }
            );

            expect(res.status).toBe(200);
            expect(res.data.msg).toBe("book is successfully deleted");
        });
    });

});
