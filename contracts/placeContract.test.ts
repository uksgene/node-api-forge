import path from "path";
import axios from "axios";
import { PactV3 } from "@pact-foundation/pact";

const pactEnabled = process.env.PACT_ENABLED === "true";

(pactEnabled ? describe : describe.skip)("Place API Contract", () => {

    const provider = new PactV3({
        dir: path.resolve(process.cwd(), "reports/pacts"),
        consumer: "PlaceConsumer",
        provider: "PlaceProvider"
    });

    test("Add Place contract", () => {
        provider
            .given("provider accepts new place")
            .uponReceiving("a request to add a place")
            .withRequest({
                method: "POST",
                path: "/maps/api/place/add/json",
                query: { key: "qaclick123" },
                headers: { "Content-Type": "application/json" },
                body: {
                    location: { lat: 10.1, lng: 20.2 },
                    accuracy: 50,
                    name: "Contract Place",
                    phone_number: "+19995550123",
                    address: "Contract Street",
                    types: ["shop"],
                    website: "https://example.com",
                    language: "English-IN"
                }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: { status: "OK", place_id: "abc123", scope: "APP" }
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.post(
                `${mockserver.url}/maps/api/place/add/json?key=qaclick123`,
                {
                    location: { lat: 10.1, lng: 20.2 },
                    accuracy: 50,
                    name: "Contract Place",
                    phone_number: "+19995550123",
                    address: "Contract Street",
                    types: ["shop"],
                    website: "https://example.com",
                    language: "English-IN"
                },
                { headers: { "Content-Type": "application/json" } }
            );

            expect(res.status).toBe(200);
            expect(res.data.status).toBe("OK");
        });
    });

    test("Get Place contract", () => {
        provider
            .given("place exists")
            .uponReceiving("a request to get a place")
            .withRequest({
                method: "GET",
                path: "/maps/api/place/get/json",
                query: { place_id: "abc123", key: "qaclick123" }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: {
                    location: { lat: 10.1, lng: 20.2 },
                    accuracy: 50,
                    name: "Contract Place",
                    phone_number: "+19995550123",
                    address: "Contract Street",
                    types: ["shop"],
                    website: "https://example.com",
                    language: "English-IN"
                }
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.get(
                `${mockserver.url}/maps/api/place/get/json?place_id=abc123&key=qaclick123`
            );

            expect(res.status).toBe(200);
            expect(res.data.name).toBe("Contract Place");
        });
    });

    test("Update Place contract", () => {
        provider
            .given("place exists and can be updated")
            .uponReceiving("a request to update a place")
            .withRequest({
                method: "PUT",
                path: "/maps/api/place/update/json",
                headers: { "Content-Type": "application/json" },
                body: {
                    place_id: "abc123",
                    address: "Automation Street",
                    key: "qaclick123"
                }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: { msg: "Address successfully updated" }
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.put(
                `${mockserver.url}/maps/api/place/update/json`,
                {
                    place_id: "abc123",
                    address: "Automation Street",
                    key: "qaclick123"
                },
                { headers: { "Content-Type": "application/json" } }
            );

            expect(res.status).toBe(200);
            expect(res.data.msg).toBe("Address successfully updated");
        });
    });

    test("Delete Place contract", () => {
        provider
            .given("place exists and can be deleted")
            .uponReceiving("a request to delete a place")
            .withRequest({
                method: "POST",
                path: "/maps/api/place/delete/json",
                query: { key: "qaclick123" },
                headers: { "Content-Type": "application/json" },
                body: { place_id: "abc123" }
            })
            .willRespondWith({
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: { status: "OK" }
            });

        return provider.executeTest(async (mockserver) => {
            const res = await axios.post(
                `${mockserver.url}/maps/api/place/delete/json?key=qaclick123`,
                { place_id: "abc123" },
                { headers: { "Content-Type": "application/json" } }
            );

            expect(res.status).toBe(200);
            expect(res.data.status).toBe("OK");
        });
    });

});
