/* eslint-disable max-classes-per-file */

const EventEmitter = require('events');

class MockWebSocket extends EventEmitter {
  constructor() {
    super();
    this.emitClose = () => this.emit('close');
    this.emitMessage = (msg) => this.emit('message', JSON.stringify(msg));
    this.emitPong = () => this.emit('pong');
    this.send = jest.fn();
    this.ping = jest.fn();
    this.terminate = jest.fn();
  }
}
const mockWebSocket = new MockWebSocket();

const mock = {
  ws: mockWebSocket,
  instance: null,
};

class MockServer extends EventEmitter {
  constructor() {
    super();

    this.clients = [mockWebSocket];
    this.handleUpgrade = jest.fn().mockImplementation((request, socket, head, cb) => {
      cb(mockWebSocket);
    });

    this.emitClose = () => this.emit('close');
    mock.instance = this;
  }
}

module.exports = {
  mock,
  Server: MockServer,
};
