require('dotenv').config();
const express = require('express');
const { unauthorized } = require('./lib/authenticator');

const PORT = process.env.PORT || 7000;

function rejectClient(socket, code, status, message) {
  socket.write(`HTTP/1.1 ${code} ${status}\r\nX-Error: ${message}\r\n\r\n`);
  socket.destroy();
}

let connectedToClient = false;
const app = express();

// eslint-disable-next-line no-console
const server = app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

server.on('upgrade', (request, socket) => {
  if (connectedToClient) {
    rejectClient(
      socket,
      423,
      'Locked',
      'Already connected with another client.',
    );
    return;
  }

  if (unauthorized(request)) {
    rejectClient(
      socket,
      401,
      'Unauthorized',
      'Unauthorized. Please, configure with a valid Auth key.',
    );
    return;
  }

  connectedToClient = true;
});
