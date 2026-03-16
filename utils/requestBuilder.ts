// Request Builder (Optional DSL)
// utils/requestBuilder.ts

class RequestBuilder {

    private body: Record<string, unknown> = {};

    setLocation(lat: number, lng: number) {
        this.body.location = { lat, lng };
        return this;
    }

    setName(name: string) {
        this.body.name = name;
        return this;
    }

    build() {
        return this.body;
    }

}

export default RequestBuilder;
