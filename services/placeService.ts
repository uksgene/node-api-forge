
// Place API service wrapper used by tests.
// Inputs: domain values (placeId, address, request body)
// Outputs: ApiClient responses consumed by test assertions/validators.
// Tests should only call services, never raw endpoints.

import ApiClient from "../core/apiClient";
import { apiKey } from "../config/env";

class PlaceService {

    static addPlace(body: Record<string, unknown>) {
        return ApiClient.post(`/maps/api/place/add/json?key=${apiKey}`, body);
    }

    static getPlace(placeId: string) {
        return ApiClient.get(`/maps/api/place/get/json?place_id=${placeId}&key=${apiKey}`);
    }

    static updatePlace(placeId: string, address: string) {

        return ApiClient.put(
            `/maps/api/place/update/json`,
            {
                place_id: placeId,
                address,
                key: apiKey
            }
        );

    }

    static deletePlace(placeId: string) {

        return ApiClient.post(
            `/maps/api/place/delete/json?key=${apiKey}`,
            { place_id: placeId }
        );

    }

}

export default PlaceService;
