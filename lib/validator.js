const { AUTH_KEY } = process.env;
const { version } = require('../package.json');

/**
 * Returns surang server version, for internal use only.
 * @function surangServerVersion
 */
function surangServerVersion() {
  return version.split('.')[0];
}

/**
 * Authenticates request with configured auth key using authorization header,
 * for internal use only.
 * @function unauthorized
 * @param {Object} request - http request object.
 * @return {boolean} - true for unauthorized requests, else false.
 */
function unauthorized(request) {
  if (AUTH_KEY && request.headers && request.headers.authorization) {
    if (request.headers.authorization === AUTH_KEY) {
      return false;
    }
  }
  return true;
}

/**
 * Checks client-server version compatibility, for internal use only.
 * @function checkVersionMismatch
 * @param {Object} request - http request object.
 * @return {string | null} - error message if any, otherwise returns null.
 */
function checkVersionMismatch(request) {
  const serverVersion = surangServerVersion();
  if (request.headers && request.headers['x-surang-version']) {
    const server = parseInt(serverVersion, 10);
    const client = parseInt(request.headers['x-surang-version'], 10);

    if (Number.isNaN(client)) {
      return `This client version is not compatible with v${serverVersion} surang-server.\n`
          + `Please update the client to v${serverVersion}.`;
    }

    if (server > client) {
      return `v${client} client is not compatible with v${server} surang-server.\n`
           + `Please upgrade the client to v${server}.`;
    }
    if (server < client) {
      return `v${client} client is not compatible with v${server} surang-server.\n`
           + `Please upgrade the server to v${client}.`;
    }
    return null;
  }
  return `This client version is not compatible with v${serverVersion} surang-server.\n`
       + `Please update the client to v${serverVersion}.`;
}

/**
 * Validates incoming client request for auth key, version & connection count.
 * @function validate
 * @param {Object} request - http request object.
 * @param {boolean} connectedToClient - flag indicating whether a client is already connected.
 * @return {Object | null} - error object if any, otherwise returns null.
 */
function validate(request, connectedToClient) {
  if (unauthorized(request)) {
    return {
      code: 401,
      text: 'Unauthorized',
      message: 'Unauthorized. Please, configure with a valid Auth key.',
    };
  }

  const versionMismatch = checkVersionMismatch(request);
  if (versionMismatch) {
    return {
      code: 406,
      text: 'Not Acceptable',
      message: `Version mismatch.\n${versionMismatch}`,
    };
  }

  if (connectedToClient) {
    return {
      code: 423,
      text: 'Locked',
      message: 'Already connected with another client.',
    };
  }

  return null;
}

module.exports = {
  validate,
};
