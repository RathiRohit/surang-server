const { AUTH_KEY } = process.env;

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
