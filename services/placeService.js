
// Tests should only call services, never raw endpoints.

const ApiClient = require("../core/apiClient");
const { apiKey } = require("../config/env");

class PlaceService {

    static addPlace(body) {
        return ApiClient.post(`/maps/api/place/add/json?key=${apiKey}`, body);
    }

    static getPlace(placeId) {
        return ApiClient.get(`/maps/api/place/get/json?place_id=${placeId}&key=${apiKey}`);
    }

    static updatePlace(placeId, address) {

        return ApiClient.put(
            `/maps/api/place/update/json`,
            {
                place_id: placeId,
                address,
                key: apiKey
            }
        );

    }

    static deletePlace(placeId) {

        return ApiClient.post(
            `/maps/api/place/delete/json?key=${apiKey}`,
            { place_id: placeId }
        );

    }

}

module.exports = PlaceService;
