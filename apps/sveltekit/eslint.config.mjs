import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/.svelte-kit/**', '**/build/**', '**/.turbo/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    // Este bloco nao declara `files` de proposito: `tseslint.configs.recommended`
    // acima tambem instala o parser sem `tsconfigRootDir`, entao um bloco so
    // para `.svelte` deixaria os `.ts` do app estourando.
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
