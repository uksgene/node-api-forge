// Central HTTP engine used by Services.
// Inputs: endpoint path and request body (if any)
// Outputs: { status, body } used by tests/services for assertions and validation
// Notes: routes to mock handler in NODE_ENV=test unless USE_REAL_API=true.

import request from "supertest";
import { baseURL } from "../config/env";
import logger from "./logger";
import handleMockRequest from "./mockServer";

type ApiResponse<T = unknown> = { status: number; body: T };

// In tests we avoid external network calls by routing to a lightweight
// in-memory mock handler that speaks the same endpoints.
const useMock = process.env.NODE_ENV === "test" && process.env.USE_REAL_API !== "true";

class ApiClient {

    static async post<T = unknown>(
        endpoint: string,
        body: Record<string, unknown>
    ): Promise<ApiResponse<T>> {

        logger.info(`POST ${endpoint}`, body);

        const res = useMock
            ? await handleMockRequest("POST", endpoint, body)
            : await request(baseURL || "")
                .post(endpoint)
                .send(body)
                .set("Content-Type", "application/json");

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));

        return res as ApiResponse<T>;
    }

    static async get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {

        logger.info(`GET ${endpoint}`);

        const res = useMock
            ? await handleMockRequest("GET", endpoint)
            : await request(baseURL || "").get(endpoint);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));

        return res as ApiResponse<T>;
    }

    static async put<T = unknown>(
        endpoint: string,
        body: Record<string, unknown>
    ): Promise<ApiResponse<T>> {

        logger.info(`PUT ${endpoint}`, body);

        const res = useMock
            ? await handleMockRequest("PUT", endpoint, body)
            : await request(baseURL || "")
                .put(endpoint)
                .send(body);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));

        return res as ApiResponse<T>;
    }

}

export default ApiClient;
