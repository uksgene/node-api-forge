# Folder Structure

```Code
supertest-forge
│
├── config
│   └── env.ts
│
├── core
│   ├── apiClient.ts
│   ├── responseValidator.ts
│   ├── mockServer.ts
│   ├── retryHandler.ts
│   └── logger.ts
│
├── services
│   ├── placeService.ts
│   └── libraryService.ts
│
├── schemas
│   ├── getPlace.schema.json
│   ├── libraryGetByAuthor.schema.json
│   └── libraryGetById.schema.json
│
├── testData
│   ├── placeDataBuilder.ts
│   └── libraryDataBuilder.ts
│
├── tests
│   ├── placeFlow.test.ts
│   └── libraryFlow.test.ts
│
├── contracts
│   ├── placeContract.test.ts
│   └── libraryContract.test.ts
│
├── utils
│   └── (empty)
│
├── reports
│
├── .env
├── package.json
└── jest.config.js
└── tsconfig.json
```

# Reason

```Code
config → environment
core → framework engine
services → API abstraction
schemas → response validation
tests → actual test cases
contracts → pact-based contract tests (opt-in with PACT_ENABLED)
utils → reusable utilities
```
