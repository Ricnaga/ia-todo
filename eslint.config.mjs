import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

const rootFiles = ['*.{js,mjs,ts}']
const packageFiles = ['packages/*/**/*.ts']

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      'apps/**',
      '**/out/**',
      '**/dist/**',
      '**/next-env.d.ts',
      'packages/server/src/db/generated/**',
    ],
  },
  {
    files: [...rootFiles, ...packageFiles],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettier,
  {
    // O editor carrega o config da raiz e o de cada app no mesmo processo e
    // registra o diretorio de cada um como candidata. Sem `tsconfigRootDir`
    // explicito, o typescript-eslint se recusa a escolher entre elas e o parse
    // do primeiro arquivo estoura. Este e o diretorio deste arquivo, que e a
    // raiz do monorepo, e nao o `process.cwd()` de quem rodou o lint.
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
)
