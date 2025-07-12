# Jest ESM migration summary

- Configured Jest directly in `package.json` with the `ts-jest` ESM preset.
- Set project `type` to `module` so Node treats `.js` files as ESM.
- Removed legacy `jest.config.cjs` and updated `tsconfig.json` to use `nodenext` modules.
- Tests remain in TypeScript and use ESM imports.

Run tests:
```bash
cd server
npm ci
npm test
```

Example output with coverage:
```
 PASS  src/tests/posts.test.ts
  ✓ GET /api/posts returns 200 (5 ms)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   100   |    100   |   100   |   100   |
----------|---------|----------|---------|---------|-------------------
```
