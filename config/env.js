// config/env.js
require("dotenv").config();

module.exports = {
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY
};
