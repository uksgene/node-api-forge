// This is the central HTTP engine.

const request = require("supertest");
const { baseURL } = require("../config/env");
const logger = require("./logger");
const handleMockRequest = require("./mockServer");

// In tests we avoid external network calls by routing to a lightweight
// in-memory mock handler that speaks the same endpoints.
const useMock = process.env.NODE_ENV === "test";

class ApiClient {

    static async post(endpoint, body) {

        logger.info(`POST ${endpoint}`, body);

        const res = useMock
            ? await handleMockRequest("POST", endpoint, body)
            : await request(baseURL)
                .post(endpoint)
                .send(body)
                .set("Content-Type", "application/json");

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }));

        return res;
    }

    static async get(endpoint) {

        logger.info(`GET ${endpoint}`);

        const res = useMock
            ? await handleMockRequest("GET", endpoint)
            : await request(baseURL).get(endpoint);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }));

        return res;
    }

    static async put(endpoint, body) {

        logger.info(`PUT ${endpoint}`, body);

        const res = useMock
            ? await handleMockRequest("PUT", endpoint, body)
            : await request(baseURL)
                .put(endpoint)
                .send(body);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }));

        return res;
    }

}

module.exports = ApiClient;
