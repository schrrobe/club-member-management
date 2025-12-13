module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  ignorePatterns: ["**/dist/**", "**/node_modules/**"],
  overrides: [
    {
      files: ["backend/src/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["backend/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      rules: {},
    },
  ],
};

