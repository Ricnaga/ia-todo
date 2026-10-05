// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3001 },
  // `@nuxt/fonts` baixa a Hanken Grotesk no build, gera o `@font-face` com
  // fallback de metricas ajustadas (fontaine, evita salto de layout) e serve da
  // propria origem, sem request a terceiros em producao. O `@nuxt/ui` ja o
  // registra por padrao (`fonts: true`), mas entrar so por transitiva seria
  // depender de um detalhe do modulo -- por isso a declaracao explicita.
  modules: ['@nuxt/ui', '@nuxt/fonts', '@nuxtjs/color-mode'],
  fonts: {
    // A familia entra no CSS por custom property (`--ds-font-sans` em
    // app/assets/css/main.css), e nao por um `font-family:` direto. O plugin
    // descarta arquivos CSS sem a string `font-family:` -- entao sem esta opcao
    // a Hanken nunca seria resolvida. Ver o override em main.css.
    processCSSVariables: true,
    families: [
      {
        name: 'Hanken Grotesk',
        provider: 'google',
        // Range, e nao a lista de pesos: numere 400, 500, 600 e 700 o provider
        // baixa uma instancia estatica por peso (e por cada estilo italico),
        // replicando o que o `next/font` e o Fontsource ja entregam em um
        // arquivo so com o eixo `wght`. Ver os arquivos em `_fonts/` no build.
        weights: ['400 700'],
      },
    ],
  },
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
