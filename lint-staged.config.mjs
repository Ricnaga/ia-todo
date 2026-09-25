const shellQuote = (file) => `'${file.replace(/'/g, `'\\''`)}'`

const withFiles = (command, files) => `${command} ${files.map(shellQuote).join(' ')}`

const config = {
  'apps/nextjs/**/*.{js,jsx,ts,tsx,mjs,cjs}': (files) => [
    withFiles('pnpm --filter @ia-task-manager/nextjs exec eslint --fix', files),
    withFiles('prettier --write', files),
  ],
  '*.{json,md,css,html}': ['prettier --write'],
}

export default config
