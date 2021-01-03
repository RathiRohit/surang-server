/* eslint-disable max-classes-per-file */

const EventEmitter = require('events');

class MockWebSocket extends EventEmitter {
  constructor() {
    super();
    this.emitClose = () => this.emit('close');
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

    this.handleUpgrade = jest.fn().mockImplementation((request, socket, head, cb) => {
      cb(mockWebSocket);
    });

    mock.instance = this;
  }
}

module.exports = {
  mock,
  Server: MockServer,
};
