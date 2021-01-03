const { AUTH_KEY } = process.env;

/**
 * Authenticates request with configured auth key using authorization header.
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

module.exports = {
  unauthorized,
};
