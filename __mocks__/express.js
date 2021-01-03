const mockServer = {
  on: jest.fn(),
};

const mockApp = {
  server: mockServer,
  listen: jest.fn().mockReturnValue(mockServer),
};

module.exports = () => mockApp;
