
// Request Builder (Optional DSL)
// utils/requestBuilder.js

class RequestBuilder {

    constructor() {
        this.body = {};
    }

    setLocation(lat, lng) {
        this.body.location = { lat, lng };
        return this;
    }

    setName(name) {
        this.body.name = name;
        return this;
    }

    build() {
        return this.body;
    }

}

module.exports = RequestBuilder;
