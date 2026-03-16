// Notes API HTTP engine.
// Inputs: endpoint path, optional body, optional auth token
// Outputs: { status, body } consumed by NotesService/tests.
import request from "supertest";
import { notesBaseURL } from "../config/env";
import logger from "./logger";
import handleMockRequest from "./mockServer";

type ApiResponse<T = unknown> = { status: number; body: T };

const useMock = process.env.NODE_ENV === "test" && process.env.USE_REAL_API !== "true";

const withAuth = (token?: string): Record<string, string> => {
    return token ? { "x-auth-token": token } : {};
};

class NotesApiClient {

    static async get<T = unknown>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
        logger.info(`GET ${endpoint}`);
        const headers = withAuth(token);
        if (!useMock) {
            const fullUrl = new URL(endpoint, notesBaseURL || "").toString();
            console.log(`FULL_URL: ${fullUrl}`);
        }

        const res = useMock
            ? await handleMockRequest("GET", endpoint, {}, headers)
            : await request(notesBaseURL || "").get(endpoint).set(headers);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));
        return res as ApiResponse<T>;
    }

    static async postForm<T = unknown>(
        endpoint: string,
        body: Record<string, unknown>,
        token?: string
    ): Promise<ApiResponse<T>> {
        logger.info(`POST ${endpoint}`, body);
        const headers = withAuth(token);
        if (!useMock) {
            const fullUrl = new URL(endpoint, notesBaseURL || "").toString();
            console.log(`FULL_URL: ${fullUrl}`);
        }

        const res = useMock
            ? await handleMockRequest("POST", endpoint, body, headers)
            : await request(notesBaseURL || "")
                .post(endpoint)
                .type("form")
                .send(body)
                .set(headers);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));
        return res as ApiResponse<T>;
    }

    static async putForm<T = unknown>(
        endpoint: string,
        body: Record<string, unknown>,
        token?: string
    ): Promise<ApiResponse<T>> {
        logger.info(`PUT ${endpoint}`, body);
        const headers = withAuth(token);
        if (!useMock) {
            const fullUrl = new URL(endpoint, notesBaseURL || "").toString();
            console.log(`FULL_URL: ${fullUrl}`);
        }

        const res = useMock
            ? await handleMockRequest("PUT", endpoint, body, headers)
            : await request(notesBaseURL || "")
                .put(endpoint)
                .type("form")
                .send(body)
                .set(headers);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));
        return res as ApiResponse<T>;
    }

    static async patchForm<T = unknown>(
        endpoint: string,
        body: Record<string, unknown>,
        token?: string
    ): Promise<ApiResponse<T>> {
        logger.info(`PATCH ${endpoint}`, body);
        const headers = withAuth(token);
        if (!useMock) {
            const fullUrl = new URL(endpoint, notesBaseURL || "").toString();
            console.log(`FULL_URL: ${fullUrl}`);
        }

        const res = useMock
            ? await handleMockRequest("PATCH", endpoint, body, headers)
            : await request(notesBaseURL || "")
                .patch(endpoint)
                .type("form")
                .send(body)
                .set(headers);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));
        return res as ApiResponse<T>;
    }

    static async delete<T = unknown>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
        logger.info(`DELETE ${endpoint}`);
        const headers = withAuth(token);
        if (!useMock) {
            const fullUrl = new URL(endpoint, notesBaseURL || "").toString();
            console.log(`FULL_URL: ${fullUrl}`);
        }

        const res = useMock
            ? await handleMockRequest("DELETE", endpoint, {}, headers)
            : await request(notesBaseURL || "").delete(endpoint).set(headers);

        logger.info("Response", res.body);
        console.log(JSON.stringify({ endpoint, response: res.body }, null, 2));
        return res as ApiResponse<T>;
    }

}

export default NotesApiClient;
