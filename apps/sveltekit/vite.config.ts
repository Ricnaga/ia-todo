import adapter from '@sveltejs/adapter-auto'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

const workspacePackages = [
  '@ia-task-manager/schemas',
  '@ia-task-manager/server',
  '@ia-task-manager/bff',
]

// O `packages/server/src/config/environment.ts` valida `process.env` com zod no
// import e lanca se faltar var. O Nuxt/Nitro carrega o `.env` sozinho, o Vite
// nao: ele so expoe no client o que tem prefixo `VITE_`, e o `$env/*` do
// SvelteKit le `process.env` depois do tempo. Por isso o `.env` e lido aqui, no
// unico lugar que roda antes de o servidor atender um request.
Object.assign(process.env, loadEnv('development', import.meta.dirname, ''))

export default defineConfig({
  server: {
    port: 5173,
    // O Vite descobre a raiz do workspace pelo campo `workspaces` do
    // package.json, que o pnpm nao escreve: sem `fs.allow` ele recusa servir
    // os packages source-only do monorepo (fora do app).
    fs: { allow: ['..', '../..'] },
  },
  preview: { port: 5173 },
  // Os `@ia-task-manager/*` sao source-only (`main` -> `src/index.ts`, sem etapa
  // de build). O Vite os trataria como dependencia externa, sem compilar o
  // TypeScript e sem enxergar o `better-sqlite3` nativo.
  ssr: { noExternal: workspacePackages },
  optimizeDeps: { exclude: workspacePackages },
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },

      // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
      // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
      // See https://svelte.dev/docs/kit/adapters for more information about adapters.
      adapter: adapter(),
    }),
  ],
})
