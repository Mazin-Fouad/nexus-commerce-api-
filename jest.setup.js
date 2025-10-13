// Global setup for all tests

// Erhöhe das Timeout für alle Tests
jest.setTimeout(10000);

// Unterdrücke Console-Ausgaben während Tests (optional)
global.console = {
  ...console,
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  debug: jest.fn(),
};
