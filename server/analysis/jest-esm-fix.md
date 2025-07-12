# Jest ESM Fix Report

## Problem
`posts.test.ts` failed with "Cannot use import statement outside a module" because Jest did not treat TypeScript files as ES modules.

## Solution
- Updated `server/jest.config.cjs` to use `ts-jest/presets/default-esm` preset and ESM transform options.
- Set `extensionsToTreatAsEsm` to `['.ts']` and added `moduleNameMapper` for `.js` paths.
- Declared `"type": "module"` and Jest section in `server/package.json`.
- Removed other Jest configs.
- Converted tests in `posts.test.ts` to ESM imports.
- Harmonised controller and router exports with singular names.

## Usage
Run tests with:

```bash
node server/node_modules/jest/bin/jest.js --config server/jest.config.cjs --coverage
```

## Coverage
See generated coverage output after running the command.
