# Jest ESM Fix

## Problem
Tests failed to run under Jest with ES modules. Old configs and CommonJS tests caused import issues.

## Changes
- Replaced Jest section in `package.json` to scan `src/` and handle ESM with babel-jest.
- Added `babel.config.js` with presets for Node 20 and TypeScript.
- Converted `posts.test` back to TypeScript ESM.
- Added Babel dev dependencies.

## Test Commands
Run inside `server/`:
```bash
npm ci
npm test
```
