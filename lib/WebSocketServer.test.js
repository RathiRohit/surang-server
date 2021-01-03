/* eslint-disable global-require */

jest.mock('ws');
jest.mock('./PingPong');

const PingPong = require('./PingPong');

const dummyRequest = { testRequest: 'testRequest' };
const dummySocket = { testSocket: 'testSocket' };
const dummyHead = { testHead: 'testHead' };
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
const remoteGetRequest = {
  ...remoteRequest,
  method: 'GET',
};
const expectedGetRequestMsg = {
  cookies: 'test-cookies',
  method: 'GET',
  url: '/test/url',
  headers: { 'test-header': 'test-value' },
  reqID: 'test-uuid',
};
const remoteHeadRequest = {
  ...remoteRequest,
  method: 'HEAD',
};
const expectedHeadRequestMsg = {
  cookies: 'test-cookies',
  method: 'HEAD',
  url: '/test/url',
  headers: { 'test-header': 'test-value' },
  reqID: 'test-uuid',
};
const remoteResponse = {
  set: jest.fn(),
  status: jest.fn(),
  send: jest.fn(),
  end: jest.fn(),
};

describe('WebSocketServer', () => {
  let WebSocket;
  let WebSocketServer;

  beforeEach(() => {
    jest.isolateModules(() => {
      WebSocket = require('ws');
      WebSocketServer = require('./WebSocketServer');
    });
  });

  it('should enable ping-pong on start and stop on server close', () => {
    const wss = new WebSocketServer(() => {});

    expect(PingPong.mockInstance.wss).toEqual(wss.server);
    expect(PingPong.mockInstance.interval).toEqual(45000);

    WebSocket.mock.instance.emitClose();
    expect(PingPong.mockInstance.stop).toHaveBeenCalledTimes(1);
  });

  it('should clear stored responses & call close callback on connection close', () => {
    const onClose = jest.fn();
    const wss = new WebSocketServer(onClose);
    wss.reqResMap['test-uuid'] = remoteResponse;

    wss.handleUpgrade(dummyRequest, dummySocket, dummyHead, () => {});
    WebSocket.mock.ws.emitClose();

    expect(remoteResponse.end).toHaveBeenCalledTimes(1);
    expect(wss.reqResMap).toEqual({});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should forward client response to remote', () => {
    const wss = new WebSocketServer(() => {});
    wss.handleUpgrade(dummyRequest, dummySocket, dummyHead, () => {});
    wss.handleRequest(remoteRequest, remoteResponse);
    expect(wss.reqResMap['test-uuid']).not.toBeUndefined();

    WebSocket.mock.ws.emitMessage({
      reqID: 'test-uuid',
      headers: 'test-headers',
      status: 200,
      body: 'test-body',
    });

    expect(PingPong.enable).toHaveBeenCalledTimes(1);
    expect(PingPong.enable).toHaveBeenCalledWith(WebSocket.mock.ws);
    expect(remoteResponse.set).toHaveBeenCalledTimes(1);
    expect(remoteResponse.set).toHaveBeenCalledWith('test-headers');
    expect(remoteResponse.status).toHaveBeenCalledTimes(1);
    expect(remoteResponse.status).toHaveBeenCalledWith(200);
    expect(remoteResponse.send).toHaveBeenCalledTimes(1);
    expect(remoteResponse.send).toHaveBeenCalledWith('test-body');
    expect(wss.reqResMap['test-uuid']).toBeUndefined();
  });

  it('should ignore client response if reqID is not found', () => {
    const wss = new WebSocketServer(() => {});
    wss.handleUpgrade(dummyRequest, dummySocket, dummyHead, () => {});
    wss.handleRequest(remoteRequest, remoteResponse);

    WebSocket.mock.ws.emitMessage({
      headers: 'test-headers',
      status: 200,
      body: 'test-body',
    });

    expect(remoteResponse.set).toHaveBeenCalledTimes(0);
    expect(remoteResponse.status).toHaveBeenCalledTimes(0);
    expect(remoteResponse.send).toHaveBeenCalledTimes(0);
    expect(wss.reqResMap['test-uuid']).not.toBeUndefined();
  });

  describe('handleUpgrade', () => {
    it('should handle upgrade', () => {
      const onSuccess = jest.fn();
      const wss = new WebSocketServer(() => {});

      wss.handleUpgrade(dummyRequest, dummySocket, dummyHead, onSuccess);

      expect(WebSocket.mock.instance.handleUpgrade).toHaveBeenCalledTimes(1);
      expect(WebSocket.mock.instance.handleUpgrade.mock.calls[0][0]).toEqual(dummyRequest);
      expect(WebSocket.mock.instance.handleUpgrade.mock.calls[0][1]).toEqual(dummySocket);
      expect(WebSocket.mock.instance.handleUpgrade.mock.calls[0][2]).toEqual(dummyHead);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleRequest', () => {
    it('should handle request and store response', () => {
      const wss = new WebSocketServer(() => {});

      wss.handleRequest(remoteRequest, remoteResponse);

      expect(WebSocket.mock.ws.send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(WebSocket.mock.ws.send.mock.calls[0][0])).toEqual(
        expectedRequestMsg,
      );
      expect(wss.reqResMap['test-uuid']).toEqual(remoteResponse);
    });

    it('should handle request without body for GET', () => {
      const wss = new WebSocketServer(() => {});

      wss.handleRequest(remoteGetRequest, remoteResponse);

      expect(WebSocket.mock.ws.send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(WebSocket.mock.ws.send.mock.calls[0][0])).toEqual(
        expectedGetRequestMsg,
      );
      expect(wss.reqResMap['test-uuid']).toEqual(remoteResponse);
    });

    it('should handle request without body for HEAD', () => {
      const wss = new WebSocketServer(() => {});

      wss.handleRequest(remoteHeadRequest, remoteResponse);

      expect(WebSocket.mock.ws.send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(WebSocket.mock.ws.send.mock.calls[0][0])).toEqual(
        expectedHeadRequestMsg,
      );
      expect(wss.reqResMap['test-uuid']).toEqual(remoteResponse);
    });
  });
});
