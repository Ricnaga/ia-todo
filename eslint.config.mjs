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
)
