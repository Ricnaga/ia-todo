export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3001 },

  modules: ['@nuxt/ui', '@nuxt/fonts', '@nuxtjs/color-mode'],

  components: [{ path: '~/app/components', pathPrefix: false }],
  fonts: {
    processCSSVariables: true,
    families: [
      {
        name: 'Hanken Grotesk',
        provider: 'google',

        weights: ['400 700'],
      },
    ],
  },
  css: ['~/assets/css/main.css'],
  build: {
    transpile: ['@ia-task-manager/schemas', '@ia-task-manager/server', '@ia-task-manager/bff'],
  },
  nitro: {
    externals: {
      external: ['better-sqlite3', '@prisma/client', '@prisma/adapter-better-sqlite3'],
    },

    moduleSideEffects: ['@ia-task-manager/bff'],
  },
})
