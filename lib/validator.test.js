/* eslint-disable global-require */

const { version } = require('../package.json');

const authenticRequest = {
  headers: {
    authorization: 'test-auth-key',
    'x-surang-version': version.split('.')[0],
  },
};

const authenticRequestWithoutVersion = {
  headers: {
    authorization: 'test-auth-key',
  },
};

const authenticRequestWithInvalidVersion = {
  headers: {
    authorization: 'test-auth-key',
    'x-surang-version': 'non-numeric-version-here',
  },
};

const authenticRequestWithSmallerVersion = {
  headers: {
    authorization: 'test-auth-key',
    'x-surang-version': '-1',
  },
};

const authenticRequestWithGreaterVersion = {
  headers: {
    authorization: 'test-auth-key',
    'x-surang-version': `${parseInt(version.split('.')[0], 10) + 1}`,
  },
};

const unauthenticRequest = {
  headers: {
    authorization: 'test-auth-other-key',
    'x-surang-version': version.split('.')[0],
  },
};

describe('validate', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should indicate unauthorized if AUTH_KEY is absent', () => {
    const { validate } = require('./validator');

    expect(validate(authenticRequest, false)).toEqual({
      code: 401,
      text: 'Unauthorized',
      message: 'Unauthorized. Please, configure with a valid Auth key.',
    });
  });

  it('should indicate unauthorized if headers are absent', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    expect(validate({}, false)).toEqual({
      code: 401,
      text: 'Unauthorized',
      message: 'Unauthorized. Please, configure with a valid Auth key.',
    });
  });

  it('should indicate unauthorized if authorization header is absent', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    expect(validate({ headers: {} }, false)).toEqual({
      code: 401,
      text: 'Unauthorized',
      message: 'Unauthorized. Please, configure with a valid Auth key.',
    });
  });

  it('should indicate unauthorized if authorization header is invalid', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    expect(validate(unauthenticRequest, false)).toEqual({
      code: 401,
      text: 'Unauthorized',
      message: 'Unauthorized. Please, configure with a valid Auth key.',
    });
  });

  it('should indicate version mismatch if version header is absent', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    const server = version.split('.')[0];
    const expectedMsg = `This client version is not compatible with v${server} surang-server.\n`
                      + `Please update the client to v${server}.`;

    expect(validate(authenticRequestWithoutVersion, false)).toEqual({
      code: 406,
      text: 'Not Acceptable',
      message: `Version mismatch.\n${expectedMsg}`,
    });
  });

  it('should indicate version mismatch if version header is invalid', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    const server = version.split('.')[0];
    const expectedMsg = `This client version is not compatible with v${server} surang-server.\n`
        + `Please update the client to v${server}.`;

    expect(validate(authenticRequestWithInvalidVersion, false)).toEqual({
      code: 406,
      text: 'Not Acceptable',
      message: `Version mismatch.\n${expectedMsg}`,
    });
  });

  it('should indicate version mismatch if server > client', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    const server = version.split('.')[0];
    const expectedMsg = `v-1 client is not compatible with v${server} surang-server.\n`
        + `Please upgrade the client to v${server}.`;

    expect(validate(authenticRequestWithSmallerVersion, false)).toEqual({
      code: 406,
      text: 'Not Acceptable',
      message: `Version mismatch.\n${expectedMsg}`,
    });
  });

  it('should indicate version mismatch if server < client', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    const server = version.split('.')[0];
    const client = parseInt(server, 10) + 1;
    const expectedMsg = `v${client} client is not compatible with v${server} surang-server.\n`
        + `Please upgrade the server to v${client}.`;

    expect(validate(authenticRequestWithGreaterVersion, false)).toEqual({
      code: 406,
      text: 'Not Acceptable',
      message: `Version mismatch.\n${expectedMsg}`,
    });
  });

  it('should indicate invalid if connected to other client', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    expect(validate(authenticRequest, true)).toEqual({
      code: 423,
      text: 'Locked',
      message: 'Already connected with another client.',
    });
  });

  it('should indicate valid if all is well', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { validate } = require('./validator');

    expect(validate(authenticRequest, false)).toBeNull();
  });
});
