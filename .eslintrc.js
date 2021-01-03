module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
    'plugin:jest/style',
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'jest/no-done-callback': 0,
  },
};
