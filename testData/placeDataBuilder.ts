// Place payload builder for tests.
// Inputs: optional customPlace.json (partial or full payload)
// Outputs: place request body used by PlaceService.addPlace in tests.
// Keep this builder dependency-free so Jest can run in CommonJS without
// ESM transforms. We only need realistic-looking values, not full faker.
import fs from "fs";
import path from "path";

type PlacePayload = {
    location: { lat: number; lng: number };
    accuracy: number;
    name: string;
    phone_number: string;
    address: string;
    types: string[];
    website: string;
    language: string;
};

const CUSTOM_PATH = path.join(__dirname, "customPlace.jsonc");

const stripJsonComments = (input: string) => {
    return input
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
};

function buildPlace() {
    const randomString = (prefix: string) => {
        const suffix = Math.random().toString(36).slice(2, 10);
        return `${prefix}-${suffix}`;
    };

    const randomInRange = (min: number, max: number) => {
        return Number((Math.random() * (max - min) + min).toFixed(6));
    };

    const defaultPlace: PlacePayload = {
        location: {
            lat: randomInRange(-90, 90),
            lng: randomInRange(-180, 180)
        },
        accuracy: 50,
        name: randomString("Test Shop"),
        phone_number: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `${Math.floor(100 + Math.random() * 900)} Test Street`,
        types: ["shop"],
        website: `https://${randomString("shop")}.example`,
        language: "English-IN"
    };

    if (fs.existsSync(CUSTOM_PATH)) {
        try {
            const raw = fs.readFileSync(CUSTOM_PATH, "utf-8").trim();
            if (raw) {
                const custom = JSON.parse(stripJsonComments(raw)) as Partial<PlacePayload>;
                return {
                    ...defaultPlace,
                    ...custom,
                    location: {
                        ...defaultPlace.location,
                        ...(custom.location || {})
                    }
                };
            }
        } catch {
            return defaultPlace;
        }
    }

    return defaultPlace;
}

export default buildPlace;
