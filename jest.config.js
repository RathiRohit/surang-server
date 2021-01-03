module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: -10,
    },
  },
  moduleFileExtensions: [
    'js',
    'json',
  ],
  testEnvironment: 'node',
  testMatch: [
    '**/*.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
};
