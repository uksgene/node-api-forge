// config/env.ts
import dotenv from "dotenv";

dotenv.config();

export const baseURL = process.env.BASE_URL;
export const apiKey = process.env.API_KEY;
