# Fix import.meta in Jest

Jest failed to parse TypeScript files that use `import.meta` because `babel-jest` lacked the plugin and ESM settings. The solution adds `@babel/plugin-syntax-import-meta` to Babel and updates Jest configuration to treat `.ts`, `.js`, and `.cjs` as ESM.

## Verification
```bash
cd server
npm install
npx jest --coverage
```
