// filepath: /Users/bahaa/projects/nasdaq-stocks-poc-app/jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globals: {
    "ts-jest": {
      diagnostics: {
        exclude: ["**"],
      },
    },
  },
};
