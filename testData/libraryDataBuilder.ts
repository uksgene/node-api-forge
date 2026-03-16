// Builder for Library API payloads without external dependencies.
function buildBook() {
    const randomString = (prefix: string) => {
        const suffix = Math.random().toString(36).slice(2, 6);
        return `${prefix}${suffix}`;
    };

    const isbn = randomString("bk");
    const aisle = String(Math.floor(100 + Math.random() * 900));

    return {
        name: "Learn API Testing with Node",
        isbn,
        aisle,
        author: "John foe"
    };
}

export default buildBook;
