jest.mock('ws');

const WebSocket = require('ws');
const WebSocketServer = require('./WebSocketServer');

const dummyRequest = { testRequest: 'testRequest' };
const dummySocket = { testSocket: 'testSocket' };
const dummyHead = { testHead: 'testHead' };

describe('WebSocketServer', () => {
  it('should call close callback on connection close', () => {
    const onClose = jest.fn();
    const wss = new WebSocketServer(onClose);

    wss.handleUpgrade(dummyRequest, dummySocket, dummyHead, () => {});
    WebSocket.mock.ws.emitClose();

    expect(onClose).toHaveBeenCalledTimes(1);
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
});
