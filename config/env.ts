// config/env.ts
// Loads environment variables for the API tests.
// Inputs: .env file with BASE_URL and API_KEY
// Outputs: exported baseURL and apiKey used by ApiClient/Services
// Optional flag: USE_REAL_API=true forces real HTTP even in test mode.
import dotenv from "dotenv";

dotenv.config();

export const baseURL = process.env.BASE_URL;
export const apiKey = process.env.API_KEY;
export const notesBaseURL =
    process.env.NOTES_BASE_URL || "https://practice.expandtesting.com";
