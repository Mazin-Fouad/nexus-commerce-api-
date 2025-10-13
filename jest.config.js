module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__test__/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/database.js",
    "!src/config/*.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
