module.exports = {
  extends: ["../../.eslintrc.base.json"],
  parserOptions: {
    project: "./tsconfig.json",
    // Must be an absolute path (not a static relative string) since ESLint
    // is invoked from different working directories in this monorepo:
    // `pnpm run lint` / turbo run with cwd = this package, but husky's
    // lint-staged runs eslint from the repo root without cd-ing in first.
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
