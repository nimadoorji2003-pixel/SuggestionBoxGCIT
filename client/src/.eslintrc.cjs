// client/.eslintrc.cjs
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true, // for testing-library / vitest DOM stuff
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/prop-types": "off",
  },
  ignorePatterns: ["node_modules/", "dist/", "coverage/"],
};
