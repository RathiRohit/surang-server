/* eslint-disable global-require */

jest.mock('ws');

const WebSocket = require('ws');
const express = require('express');

const authenticRequest = {
  headers: { authorization: 'test-auth-key' },
};

const unauthenticRequest = {
  headers: { authorization: 'test-auth-other-key' },
};

describe('server', () => {
  const originalEnv = process.env;
  const mockApp = express();
  const mockServer = mockApp.server;
  const mockSocket = {
    write: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockApp.listen.mockClear();
    mockServer.on.mockClear();
    mockSocket.write.mockClear();
    mockSocket.destroy.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should start listening on port 7000 if port is not provided', () => {
    jest.isolateModules(() => require('./server'));
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(mockApp.listen).toHaveBeenCalledTimes(1);
    expect(mockApp.listen.mock.calls[0][0]).toBe(7000);

    const successCb = mockApp.listen.mock.calls[0][1];
    successCb();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('Listening on port: 7000');
    consoleLogSpy.mockRestore();
  });

  it('should start listening on provided port', () => {
    process.env.PORT = 6500;
    jest.isolateModules(() => require('./server'));
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(mockApp.listen).toHaveBeenCalledTimes(1);
    expect(mockApp.listen.mock.calls[0][0]).toBe(6500);

    const successCb = mockApp.listen.mock.calls[0][1];
    successCb();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('Listening on port: 6500');
    consoleLogSpy.mockRestore();
  });

  it('should add listener for upgrade event', () => {
    jest.isolateModules(() => require('./server'));

    expect(mockServer.on).toHaveBeenCalledTimes(1);
    expect(mockServer.on.mock.calls[0][0]).toBe('upgrade');
  });

  it('should reject with 423 if second client tries to connect', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    jest.isolateModules(() => require('./server'));

    const upgradeCb = mockServer.on.mock.calls[0][1];
    upgradeCb(authenticRequest, mockSocket);
    expect(mockSocket.destroy).toHaveBeenCalledTimes(0);

    upgradeCb(authenticRequest, mockSocket);
    expect(mockSocket.write).toHaveBeenCalledTimes(1);
    expect(mockSocket.write).toHaveBeenCalledWith(
      'HTTP/1.1 423 Locked\r\nX-Error: Already connected with another client.\r\n\r\n',
    );
    expect(mockSocket.destroy).toHaveBeenCalledTimes(1);
  });

  it('should reject with 401 if unauthorized', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    jest.isolateModules(() => require('./server'));

    const upgradeCb = mockServer.on.mock.calls[0][1];
    upgradeCb(unauthenticRequest, mockSocket);
    expect(mockSocket.write).toHaveBeenCalledTimes(1);
    expect(mockSocket.write).toHaveBeenCalledWith(
      'HTTP/1.1 401 Unauthorized\r\n'
        + 'X-Error: Unauthorized. Please, configure with a valid Auth key.\r\n\r\n',
    );
    expect(mockSocket.destroy).toHaveBeenCalledTimes(1);
  });

  it('should not connect to unauthentic client', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    jest.isolateModules(() => require('./server'));

    const upgradeCb = mockServer.on.mock.calls[0][1];
    upgradeCb(unauthenticRequest, mockSocket);
    expect(mockSocket.destroy).toHaveBeenCalledTimes(1);

    upgradeCb(authenticRequest, mockSocket);
    expect(mockSocket.destroy).toHaveBeenCalledTimes(1);

    upgradeCb(authenticRequest, mockSocket);
    expect(mockSocket.destroy).toHaveBeenCalledTimes(2);
  });

  it('should not reject second client if first is already disconnected', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    jest.isolateModules(() => require('./server'));

    const upgradeCb = mockServer.on.mock.calls[0][1];
    upgradeCb(authenticRequest, mockSocket);
    expect(mockSocket.destroy).toHaveBeenCalledTimes(0);

    upgradeCb(authenticRequest, mockSocket);
    expect(mockSocket.destroy).toHaveBeenCalledTimes(1);

    WebSocket.mock.ws.emitClose();

    upgradeCb(authenticRequest, mockSocket);
    expect(mockSocket.destroy).toHaveBeenCalledTimes(1);
  });
});
