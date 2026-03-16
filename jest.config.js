// jest.config.js
// Jest runner configuration for TypeScript tests and contract suites.
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",               // Node.js environment
    verbose: true,                         // Print test names and results
    maxWorkers: "50%",                     // Jest will use 50% of available CPU cores to run tests.
    testMatch: [
        "**/tests/**/*.test.ts",
        "**/contracts/**/*.test.ts"
    ], // Where Jest should look for test files
    moduleFileExtensions: ["ts", "js", "json"],
    testTimeout: 30000,                    // 30 seconds per test for API response time
    collectCoverage: true,                 // Enable coverage report
    coverageDirectory: "coverage",         // Output coverage folder
    coverageReporters: ["json", "lcov", "text", "clover"],

    // Optional: Add reporters for HTML report
    reporters: [
        "default",
        [
            "jest-html-reporters",
            {
                publicPath: "./reports",
                filename: "report.html",
                expand: true
            }
        ]
    ],

    // Optional: Setup files if you need environment variables
    setupFiles: ["dotenv/config"]
};
