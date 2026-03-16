# Folder Structure

```Code
supertest-forge
│
├── config
│   └── env.js
│
├── core
│   ├── apiClient.js
│   ├── responseValidator.js
│
├── services
│   └── placeService.js
│
├── schemas
│   └── placeSchema.json
│
├── testData
│   └── placeData.json
│
├── tests
│   └── placeFlow.test.js
│
├── utils
│   └── requestBuilder.js
│
├── reports
│
├── .env
├── package.json
└── jest.config.js
```

# Reason

```Code
config → environment
core → framework engine
services → API abstraction
schemas → response validation
tests → actual test cases
utils → reusable utilities
```
