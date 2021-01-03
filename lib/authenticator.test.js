/* eslint-disable global-require */

describe('unauthorized', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should indicate unauthorized if AUTH_KEY is absent', () => {
    const { unauthorized } = require('./authenticator');

    const request = {
      headers: { authorization: 'test-auth-key' },
    };

    expect(unauthorized(request)).toBeTruthy();
  });

  it('should indicate unauthorized if headers are absent', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { unauthorized } = require('./authenticator');

    expect(unauthorized({})).toBeTruthy();
  });

  it('should indicate unauthorized if authorization header is absent', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { unauthorized } = require('./authenticator');
    const request = { headers: {} };

    expect(unauthorized(request)).toBeTruthy();
  });

  it('should indicate unauthorized if authorization header is invalid', () => {
    process.env.AUTH_KEY = 'test-auth-other-key';
    const { unauthorized } = require('./authenticator');
    const request = {
      headers: { authorization: 'test-auth-key' },
    };

    expect(unauthorized(request)).toBeTruthy();
  });

  it('should indicate authorized if authorization header is valid', () => {
    process.env.AUTH_KEY = 'test-auth-key';
    const { unauthorized } = require('./authenticator');
    const request = {
      headers: { authorization: 'test-auth-key' },
    };

    expect(unauthorized(request)).toBeFalsy();
  });
});
