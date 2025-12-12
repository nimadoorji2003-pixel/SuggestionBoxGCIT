// server/.eslintrc.cjs
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true, // Jest globals for health.test.js
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "commonjs",
  },
  rules: {
    "no-unused-vars": "warn",
    "no-undef": "error",
  },
  ignorePatterns: ["node_modules/", "coverage/", "dist/"],
};
