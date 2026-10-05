import js from '@eslint/js'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/.next/**', '**/next-env.d.ts'],
  },
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      nextCoreWebVitals,
      nextTypescript,
      tanstackQuery.configs['flat/recommended'],
    ],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@tanstack/query/exhaustive-deps': [
        'error',
        { allowlist: { variables: ['requestHeaders'], types: [] } },
      ],
    },
  },
  prettier,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
)
