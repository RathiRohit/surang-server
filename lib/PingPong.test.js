const WebSocket = require('ws');
const PingPong = require('./PingPong');

const TEST_INTERVAL = 30000;

describe('PingPong', () => {
  let wss;
  let pingPong;

  beforeEach(() => {
    jest.useFakeTimers();
    WebSocket.mock.ws.ping.mockClear();
    WebSocket.mock.ws.terminate.mockClear();
    WebSocket.mock.ws.isAlive = true;

    wss = new WebSocket.Server({ noServer: true });
    pingPong = new PingPong(wss, TEST_INTERVAL);
  });

  afterEach(() => {
    pingPong.stop();
  });

  it('should start ping-pong for given server with given interval', () => {
    expect(WebSocket.mock.ws.isAlive).toBeTruthy();
    expect(WebSocket.mock.ws.ping).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(TEST_INTERVAL);

    expect(WebSocket.mock.ws.isAlive).toBeFalsy();
    expect(WebSocket.mock.ws.ping).toHaveBeenCalledTimes(1);
    WebSocket.mock.ws.isAlive = true;

    jest.advanceTimersByTime(TEST_INTERVAL);

    expect(WebSocket.mock.ws.isAlive).toBeFalsy();
    expect(WebSocket.mock.ws.ping).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(TEST_INTERVAL);

    expect(WebSocket.mock.ws.ping).toHaveBeenCalledTimes(2);
    expect(WebSocket.mock.ws.terminate).toHaveBeenCalledTimes(1);
  });

  describe('stop', () => {
    it('should stop ping-pong', () => {
      expect(WebSocket.mock.ws.isAlive).toBeTruthy();
      expect(WebSocket.mock.ws.ping).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(TEST_INTERVAL);

      expect(WebSocket.mock.ws.isAlive).toBeFalsy();
      expect(WebSocket.mock.ws.ping).toHaveBeenCalledTimes(1);
      WebSocket.mock.ws.isAlive = true;

      pingPong.stop();
      jest.advanceTimersByTime(TEST_INTERVAL);

      expect(WebSocket.mock.ws.isAlive).toBeTruthy();
      expect(WebSocket.mock.ws.ping).toHaveBeenCalledTimes(1);
    });
  });

  describe('enable', () => {
    it('should mark ws as alive and add pong listener to it', () => {
      WebSocket.mock.ws.isAlive = false;

      PingPong.enable(WebSocket.mock.ws);

      expect(WebSocket.mock.ws.isAlive).toBeTruthy();

      WebSocket.mock.ws.isAlive = false;
      WebSocket.mock.ws.emitPong();

      expect(WebSocket.mock.ws.isAlive).toBeTruthy();
    });
  });
});
