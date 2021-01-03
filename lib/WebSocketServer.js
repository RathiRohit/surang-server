const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const PingPong = require('./PingPong');

const PING_PONG_INTERVAL = 45000;

/**
 * Represents a WebSocket server that handle all surang events and forwarding.
 * @class WebSocketServer
 */
class WebSocketServer {
  /**
   * Creates a WebSocketServer with given onClose callback.
   * @param {function} onCloseCallback - callback that will be called when connection is closed.
   */
  constructor(onCloseCallback) {
    this.reqResMap = {};
    this.server = new WebSocket.Server({ noServer: true });
    this.pingPong = new PingPong(this.server, PING_PONG_INTERVAL);
    this.registerEventHandlers(onCloseCallback);
  }

  /**
   * Registers all WebSocket listeners, for internal use only.
   * @function registerEventHandlers
   * @param {function} onCloseCallback - callback that will be called when connection is closed.
   */
  registerEventHandlers(onCloseCallback) {
    this.server.on('connection', (ws) => {
      PingPong.enable(ws);

      ws.on('message', (resData) => {
        const actualResponse = JSON.parse(resData);
        const { reqID } = actualResponse;

        if (reqID) {
          const response = this.reqResMap[reqID];
          response.set(actualResponse.headers);
          response.status(actualResponse.status);
          response.send(actualResponse.body);
          delete this.reqResMap[reqID];
        }
      });

      ws.on('close', () => {
        Object.keys(this.reqResMap).forEach((reqID) => {
          this.reqResMap[reqID].end();
        });
        this.reqResMap = {};
        onCloseCallback();
      });
    });

    this.server.on('close', () => {
      this.pingPong.stop();
    });
  }

  /**
   * Handles upgrade of connection to WebSocket connection.
   * @function handleUpgrade
   * @param {Object} request - http request object.
   * @param {Object} socket - http net.socket object.
   * @param {Object} head - http net.head object.
   * @param {function} onSuccessCallback - callback that will be called when upgrade is handled.
   */
  handleUpgrade(request, socket, head, onSuccessCallback) {
    this.server.handleUpgrade(request, socket, head, (ws) => {
      onSuccessCallback();
      this.server.emit('connection', ws);
    });
  }

  /**
   * Forwards incoming request through tunnel.
   * @function handleRequest
   * @param {Object} req - http request object.
   * @param {Object} res - http response object.
   */
  handleRequest(req, res) {
    const reqID = uuidv4();
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify({
        reqID,
        body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : req.body,
        cookies: req.cookies,
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
      }));
    });
    this.reqResMap[reqID] = res;
  }
}

module.exports = WebSocketServer;
