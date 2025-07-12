# Babel Config Fix

## Problem
`babel.config.js` was loaded as an ES module because `type: module` is set in `package.json`. Jest with `babel-jest` tried to import it, but the file used CommonJS `module.exports`, causing `module is not defined` errors.

## Changes
- Renamed `babel.config.js` to `babel.config.cjs`.
- Removed the `preset` property from the Jest configuration so only `babel-jest` handles TypeScript files.

## Verification
Run inside `server/`:
```bash
npm ci
npx jest --coverage
```
