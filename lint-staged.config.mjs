const shellQuote = (file) => `'${file.replace(/'/g, `'\\''`)}'`

const withFiles = (command, files) => `${command} ${files.map(shellQuote).join(' ')}`

const prettier = (files) => withFiles('prettier --write', files)

const lint = (files) => [withFiles('eslint --fix', files), prettier(files)]

const lintIn = (pkg) => (files) => [
  withFiles(`pnpm --filter ${pkg} exec eslint --fix`, files),
  prettier(files),
]

const config = {
  './*.{js,mjs,ts}': lint,
  'packages/*/**/*.{js,jsx,ts,tsx,mjs,cjs}': lint,
  'apps/nextjs/**/*.{js,jsx,ts,tsx,mts,cts}': lintIn('@ia-task-manager/nextjs'),
  'apps/nuxt/**/*.{vue,ts,js,mjs,cjs}': lintIn('@ia-task-manager/nuxt'),
  'apps/sveltekit/**/*.{svelte,ts,js,mjs,cjs}': lintIn('@ia-task-manager/sveltekit'),
  '*.{json,md,css,html}': ['prettier --write'],
}

export default config
