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
        // `projectService` sem `tsconfigRootDir` deixa o typescript-eslint
        // adivinhar a raiz pelo stack de chamada: ele procura um frame cujo
        // arquivo se chame `eslint.config.mjs` e usa o diretorio dele. Num
        // processo que avalia a config da raiz e a deste app ao mesmo tempo --
        // o que o editor faz num monorepo -- sobram duas candidatas e o parse
        // seguinte lanca "multiple candidate TSConfigRootDirs".
        // `import.meta.dirname` tambem tira o `process.cwd()` de dentro do
        // lint, que e a mesma armadilha que o `@nuxt/eslint-config` tem.
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
)
