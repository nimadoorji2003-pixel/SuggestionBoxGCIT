// server/eslint.config.mjs
import js from "@eslint/js";

/**
 * Minimal ESLint flat config for Node backend (CommonJS)
 */
export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: 2020,
    },
    env: {
      node: true,
      es2021: true,
    },
    rules: {
      // Tune rules if they get noisy
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
    },
  },
];
