// Keep this builder dependency-free so Jest can run in CommonJS without
// ESM transforms. We only need realistic-looking values, not full faker.
function buildPlace() {
    const randomString = (prefix) => {
        const suffix = Math.random().toString(36).slice(2, 10);
        return `${prefix}-${suffix}`;
    };

    const randomInRange = (min, max) => {
        return Number((Math.random() * (max - min) + min).toFixed(6));
    };

    return {
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
}

module.exports = buildPlace;
