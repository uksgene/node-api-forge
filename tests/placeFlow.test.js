const PlaceService = require("../services/placeService");
const buildPlace = require("../testData/placeDataBuilder");
const Validator = require("../core/responseValidator");
const schema = require("../schemas/getPlace.schema.json");
const retry = require("../core/retryHandler");

describe("Place API Flow", () => {

    let placeId;
    let place;

    beforeAll(async () => {
        place = await buildPlace();
    });

    test("Add Place", async () => {
        const res = await PlaceService.addPlace(place);
        expect(res.status).toBe(200);
        placeId = res.body.place_id;
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
        expect(res.body.status).toBe("OK");
    });

});
