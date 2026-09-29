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
    // Este bloco nao declara `files` de proposito: ele tem que alcancar todas as
    // entradas acima que instalam o parser do typescript-eslint, inclusive as
    // que vem de `eslint-config-next/typescript`.
    //
    // O editor carrega o config da raiz e o deste app no mesmo processo e
    // registra o diretorio de cada um como candidata. Sem `tsconfigRootDir`
    // explicito, o typescript-eslint se recusa a escolher entre elas e o parse
    // do primeiro arquivo estoura.
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
)
