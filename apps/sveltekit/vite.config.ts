import adapter from '@sveltejs/adapter-auto'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

const workspacePackages = [
  '@ia-task-manager/schemas',
  '@ia-task-manager/server',
  '@ia-task-manager/bff',
]

Object.assign(process.env, loadEnv('development', import.meta.dirname, ''))

export default defineConfig({
  server: {
    port: 5173,

    fs: { allow: ['..', '../..'] },
  },
  preview: { port: 5173 },

  ssr: { noExternal: workspacePackages },
  optimizeDeps: { exclude: workspacePackages },
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },

      adapter: adapter(),
    }),
  ],
})
