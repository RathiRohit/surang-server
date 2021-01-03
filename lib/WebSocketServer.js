const WebSocket = require('ws');

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
    this.server = new WebSocket.Server({ noServer: true });
    this.registerEventHandlers(onCloseCallback);
  }

  /**
   * Registers all WebSocket listeners, for internal use only.
   * @function registerEventHandlers
   * @param {function} onCloseCallback - callback that will be called when connection is closed.
   */
  registerEventHandlers(onCloseCallback) {
    this.server.on('connection', (ws) => {
      ws.on('close', onCloseCallback);
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
}

module.exports = WebSocketServer;
