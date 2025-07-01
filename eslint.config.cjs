const { createRequire } = require('module')
const path = require('path')
const requireServer = createRequire(path.join(__dirname, 'server', 'package.json'))

const js = requireServer('@eslint/js')
const tsPlugin = requireServer('@typescript-eslint/eslint-plugin')
const tsParser = requireServer('@typescript-eslint/parser')
const importPlugin = requireServer('eslint-plugin-import')

module.exports = [
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
