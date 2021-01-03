const mockServer = {
  on: jest.fn(),
};

const mockApp = {
  server: mockServer,
  listen: jest.fn().mockReturnValue(mockServer),
  use: jest.fn(),
  all: jest.fn(),
};

const mockExpress = () => mockApp;
mockExpress.json = () => 'mock-json-parser';

module.exports = mockExpress;
