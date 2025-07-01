import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    ignores: ['node_modules/', 'server/uploads/'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.ts'] },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]
