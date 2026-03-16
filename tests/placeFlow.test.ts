// End-to-end place flow test.
// Inputs: generated place payload + placeId chaining
// Outputs: status/schema assertions to validate API behavior.
import PlaceService from "../services/placeService";
import buildPlace from "../testData/placeDataBuilder";
import Validator from "../core/responseValidator";
import schema from "../schemas/getPlace.schema.json";
import retry from "../core/retryHandler";

describe("Place API Flow", () => {

    let placeId: string;
    let place: Record<string, unknown>;
    let addPlaceResponse: { place_id: string };

    beforeAll(async () => {
        place = await buildPlace();
        const res = await PlaceService.addPlace(place);
        addPlaceResponse = res.body as { place_id: string };
        placeId = addPlaceResponse.place_id;
    });

    test("Add Place", async () => {
        expect(typeof addPlaceResponse.place_id).toBe("string");
    });

    test("Get Place", async () => {
        const res = await retry(() =>
            PlaceService.getPlace(placeId)
        );
        Validator.validate(schema, res.body);
    });

    test("Update Place", async () => {
        const res = await PlaceService.updatePlace(placeId, "Automation Street");
        expect(res.status).toBe(200);
    });

    test("Delete Place", async () => {
        const res = await PlaceService.deletePlace(placeId);
        const body = res.body as { status: string };
        expect(body.status).toBe("OK");
    });

});
