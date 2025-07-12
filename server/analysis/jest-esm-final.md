# Jest ESM migration summary

- Added ESM Jest configuration in `package.json` and set `type` to `module`.
- Removed standalone `jest.config.cjs` so tests rely on package settings.
- Simplified `tsconfig.json` to use NodeNext modules and strict options from the task.
- Tests keep ESM imports with explicit `.js` extensions.

Run tests:
```bash
cd server
npm ci
npm test
```

After applying the patch, `npm test` should execute Jest using the configuration in `package.json` and report coverage.
