/* eslint-disable global-require */

jest.mock('ws');

const WebSocket = require('ws');
const express = require('express');
const { version } = require('./package.json');

const authenticRequest = {
  headers: {
    authorization: 'test-auth-key',
    'x-surang-version': version.split('.')[0],
  },
};
const unauthenticRequest = {
  headers: {
    authorization: 'test-auth-other-key',
    'x-surang-version': version.split('.')[0],
  },
};
const remoteRequest = {
  body: 'test-body',
  cookies: 'test-cookies',
  method: 'POST',
  originalUrl: '/test/url',
  headers: { 'test-header': 'test-value' },
};
const expectedRequestMsg = {
  body: 'test-body',
  cookies: 'test-cookies',
  method: 'POST',
  url: '/test/url',
  headers: { 'test-header': 'test-value' },
  reqID: 'test-uuid',
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
    jest.useFakeTimers();
    process.env = { ...originalEnv };
    mockApp.listen.mockClear();
    mockServer.on.mockClear();
    mockSocket.write.mockClear();
    mockSocket.destroy.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should setup express parsers and request handler', () => {
    jest.isolateModules(() => require('./server'));

    expect(mockApp.use).toHaveBeenCalledTimes(2);
    expect(mockApp.use).toHaveBeenCalledWith('mock-cookie-parser');
    expect(mockApp.use).toHaveBeenCalledWith('mock-json-parser');
    expect(mockApp.all).toHaveBeenCalledTimes(1);
    expect(mockApp.all.mock.calls[0][0]).toBe('*');

    const requestCb = mockApp.all.mock.calls[0][1];
    requestCb(remoteRequest, 'test-res');
    expect(WebSocket.mock.ws.send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(WebSocket.mock.ws.send.mock.calls[0][0])).toEqual(
      expectedRequestMsg,
    );
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
      'HTTP/1.1 423 Locked\r\n\r\nAlready connected with another client.\r\n',
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
      'HTTP/1.1 401 Unauthorized\r\n\r\n'
        + 'Unauthorized. Please, configure with a valid Auth key.\r\n',
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
