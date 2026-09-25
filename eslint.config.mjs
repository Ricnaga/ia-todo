import js from '@eslint/js'
import globals from 'globals'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

const appFiles = ['apps/nextjs/**/*.{js,jsx,mjs,ts,tsx,mts,cts}']

const scopedToApp = (entries) =>
  entries.map((entry) => ({
    ...entry,
    files: entry.files ? entry.files.map((pattern) => `apps/nextjs/${pattern}`) : appFiles,
  }))

const nextApp = [
  ...scopedToApp([...nextVitals, ...nextTs]),
  {
    files: appFiles,
    settings: { next: { rootDir: 'apps/nextjs' } },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]

const nodePackages = [
  {
    files: ['packages/*/src/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  ...tseslint.configs.recommended,
]

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/next-env.d.ts',
      'packages/server/src/db/generated/**',
    ],
  },
  js.configs.recommended,
  nodePackages,
  nextApp,
  prettier,
)
