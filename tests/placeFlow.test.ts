import PlaceService from "../services/placeService";
import buildPlace from "../testData/placeDataBuilder";
import Validator from "../core/responseValidator";
import schema from "../schemas/getPlace.schema.json";
import retry from "../core/retryHandler";

describe("Place API Flow", () => {

    let placeId: string;
    let place: Record<string, unknown>;

    beforeAll(async () => {
        place = await buildPlace();
    });

    test("Add Place", async () => {
        const res = await PlaceService.addPlace(place);
        const body = res.body as { place_id: string };
        expect(res.status).toBe(200);
        placeId = body.place_id;
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
