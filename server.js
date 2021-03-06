/* eslint-disable no-console */

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const WebSocketServer = require('./lib/WebSocketServer');
const { validate } = require('./lib/validator');

const PORT = process.env.PORT || 7000;

function rejectClient(socket, code, status, message) {
  socket.write(`HTTP/1.1 ${code} ${status}\r\n\r\n${message}\r\n`);
  socket.destroy();
}

let connectedToClient = false;
const wss = new WebSocketServer(() => {
  connectedToClient = false;
});

const app = express();
app.use(cookieParser());
app.use(express.json());
app.all('*', (req, res) => {
  if (connectedToClient) {
    wss.handleRequest(req, res);
    return;
  }
  res.status(503).send('503: There is no one on the other side of the tunnel :/');
});

const server = app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
server.on('upgrade', (request, socket, head) => {
  const error = validate(request, connectedToClient);
  if (error) {
    rejectClient(socket, error.code, error.text, error.message);
    return;
  }

  wss.handleUpgrade(request, socket, head, () => {
    connectedToClient = true;
  });
});
