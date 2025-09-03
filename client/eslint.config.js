import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// ESLint configuration for React application with TypeScript support
export default defineConfig([
  // Exclude build output directory from linting
  globalIgnores(['dist']),
  {
    // Apply linting rules to all JavaScript and JSX files
    files: ['**/*.{js,jsx}'],
    // Extend recommended configurations for JavaScript and React
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    // Language parsing and environment configuration
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    // Custom ESLint rules and overrides
    rules: {
      // Allow unused variables with uppercase names (constants/types)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
