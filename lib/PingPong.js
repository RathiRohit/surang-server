/* eslint-disable no-param-reassign */

function keepAlive(ws) {
  ws.isAlive = true;
}

/**
 * Represents a pinging utility used for keeping WebSocket connections in check.
 * @class PingPong
 */
class PingPong {
  /**
   * Creates a PingPong utility for given WebSocket server with provided interval.
   * @param {Object} wss - websocket server instance.
   * @param {number} interval - interval in ms to use for ping-pong.
   */
  constructor(wss, interval) {
    this.timerID = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, interval);
  }

  /**
   * Stops the ping-pong.
   * @function stop
   */
  stop() {
    clearInterval(this.timerID);
  }

  /**
   * Enables ping-pong on WS instance.
   * @function enable
   * @static
   */
  static enable(ws) {
    keepAlive(ws);
    ws.on('pong', () => keepAlive(ws));
  }
}

module.exports = PingPong;
