# Jest + Babel Audit

## Project Overview
- **Node**: `v20.19.3`
- **npm**: `11.4.2`
- **Jest**: `^29.7.0`
- **babel-jest**: `^29.7.0`
- **@babel/core**: `^7.24.0`

The project stores Jest configuration inside `package.json` and uses a separate `babel.config.cjs`.

## Current Configuration
- `babel.config.cjs` uses `@babel/preset-env`, `@babel/preset-typescript` and the `@babel/plugin-syntax-import-meta` plugin.
- Jest transforms all `.ts` and `.js` files using `babel-jest`.
- `extensionsToTreatAsEsm` included `.ts`, `.js`, and `.cjs`.

## Observed Errors
- `npm install` fails with a `403 Forbidden` error when requesting `@babel/plugin-syntax-import-meta@^7.24.0`.
- `npx jest --coverage` fails before tests run because Jest cannot be fetched.

```
npm ERR! 403 403 Forbidden - GET https://registry.npmjs.org/@babel%2fplugin-syntax-import-meta
```

```
npm ERR! 403 403 Forbidden - GET https://registry.npmjs.org/jest
```

These errors were captured during the audit.

## Findings
- The lock file lists `@babel/plugin-syntax-import-meta@7.10.4`, but `package.json` requires `^7.24.0`, a non‑existent version. This causes `npm install` to fail.
- Including `.js` and `.cjs` under `extensionsToTreatAsEsm` is unnecessary for TypeScript tests and complicates module resolution.
- `babel.config.cjs` lacked `root: true`/`babelrc: false` to ensure Jest loads only this config.

## Recommendations
1. Pin `@babel/plugin-syntax-import-meta` to the published `7.10.4` version.
2. Limit Jest's `extensionsToTreatAsEsm` to `['.ts']`.
3. Explicitly set `root: true` and `babelrc: false` in `babel.config.cjs`.
4. Reinstall modules and run tests:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx jest --coverage
   ```

## Patch Summary
Patch files in `analysis/patches/` implement these changes for quick application.
