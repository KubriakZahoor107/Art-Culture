// eslint.config.cjs
const js = require('@eslint/js');
const { createRequire } = require('module');
const { resolve } = require('path');

// Беремо плагіни та парсери з server/node_modules
const serverRequire = createRequire(resolve(process.cwd(), 'server/package.json'));
const jestPlugin = serverRequire('eslint-plugin-jest');
const tsPlugin = serverRequire('@typescript-eslint/eslint-plugin');
const tsParser = serverRequire('@typescript-eslint/parser');
const importPlugin = serverRequire('eslint-plugin-import');

module.exports = [
  js.configs.recommended,

  // 1) Загальний конфіг для усіх .js/.ts файлів
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules/', 'dist/', 'server/dist/', 'server/uploads/'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        process: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }
      }
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },

  // 2) Окремо для тестів
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    plugins: {
      jest: jestPlugin
    },
    rules: {
      ...jestPlugin.configs.recommended.rules
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals
      }
    }
  }
];
