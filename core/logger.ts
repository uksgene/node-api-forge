// Structured logger shared across the framework.
// Inputs: message + optional metadata
// Outputs: JSON logs to console and reports/api.log (used for debugging/CI artifacts)
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "reports/api.log" })
    ]
});

export default logger;
