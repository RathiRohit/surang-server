class PingPong {
  constructor(wss, interval) {
    this.wss = wss;
    this.interval = interval;

    this.stop = jest.fn();
    PingPong.mockInstance = this;
  }
}

PingPong.enable = jest.fn();

module.exports = PingPong;
