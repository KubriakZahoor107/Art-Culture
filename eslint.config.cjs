// .eslintrc.js
module.exports = {
  root: true,
  env: {
    es2023: true,
    browser: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
    extraFileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'],
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'],
        moduleDirectory: ['node_modules', 'server'],
      },
    },
  },
  rules: {
    // общие правила
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/no-unresolved': 'off',
    'no-console': 'off',
  },
  overrides: [
    // 1) фронтенд + общие утилиты
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      env: { browser: true, node: false },
      rules: {
        // если нужно — можно переопределить тут
      },
    },

    // 2) серверный код (Node.js-only)
    {
      files: ['server/**/*.{js,cjs,mjs,ts}'],
      env: { node: true, browser: false },
      rules: {
        // в серверном коде console разрешаем (но отключено глобально выше)
        'no-console': 'off',
      },
    },
  ],
};
