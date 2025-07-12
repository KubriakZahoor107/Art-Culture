# Babel + Jest Fix

## Problem
During the audit the `babel.config.cjs` file contained the `root` and `babelrc` options. Jest interpreted them as unknown keys, leading to Babel not loading properly. The Jest configuration also included `extensionsToTreatAsEsm` and `moduleNameMapper`, which are unnecessary for the server tests.

## Solution
- Simplified `babel.config.cjs` to only specify presets and plugins.
- Cleaned the Jest block in `package.json` so that it only contains the supported options.
- Pinned `@babel/plugin-syntax-import-meta` to `^7.10.4` in `devDependencies`.

After applying the patches run:

```bash
rm -rf node_modules package-lock.json
npm install
npx jest --coverage
```

Both `npm run dev` and `npm test` should start without configuration errors.
