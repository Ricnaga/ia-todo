// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3001 },
  modules: ['@nuxt/ui', '@nuxtjs/color-mode'],
  css: ['~/assets/css/main.css'],
  build: {
    // Os packages do monorepo sao source-only (`main` -> `src/index.ts`, sem
    // etapa de build), entao o Nuxt precisa compilar o TypeScript deles -- e o
    // equivalente ao `transpilePackages` do app Next.
    transpile: ['@ia-task-manager/schemas', '@ia-task-manager/server', '@ia-task-manager/bff'],
  },
  nitro: {
    externals: {
      // better-sqlite3 e binario nativo e o Prisma Client tem codigo gerado:
      // os tres precisam ficar de fora do bundle do Nitro, como o
      // `serverExternalPackages` do app Next.
      external: ['better-sqlite3', '@prisma/client', '@prisma/adapter-better-sqlite3'],
    },
    // O schema do Pothos e montado por imports de efeito (`import './modules'`),
    // e o treeshake do Nitro descartaria esses modulos -- o sintoma e o Yoga
    // subindo com `Type Query must define one or more fields`. `sideEffects:
    // true` no package.json do BFF nao resolve, porque o Nitro instala a propria
    // funcao `moduleSideEffects` e ela ignora esse campo.
    //
    // Esta opcao (array de padroes) e o ponto de extensao previsto: o Nitro
    // consulta `nitro.options.moduleSideEffects` na propria funcao, entao o
    // default dele continua valendo -- `runtimeDir` e os polyfills de
    // `unenv`/`node-fetch-native` que o Nitro precisa para o server rodar.
    // Sobrescrever `rollupConfig.treeshake.moduleSideEffects` com uma funcao
    // propria resolveria o schema, mas trocaria o default inteiro por `false`
    // em tudo que nao for o BFF.
    moduleSideEffects: ['@ia-task-manager/bff'],
  },
})
