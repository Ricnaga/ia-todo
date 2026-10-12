---
description: Gera scaffold de uma página/feature completa nos 3 apps do monorepo (Next, Nuxt, SvelteKit).
agent: frontend-engineer
---

Gere a estrutura completa de uma feature ou página no projeto, nos **três apps** (paridade de arquitetura e comportamento).

## Argumentos

`$ARGUMENTS` deve conter o caminho da feature (ex: `tarefas`, `login`).

## Passos

1. Analisar a estrutura existente do projeto (convenções espelhadas nos 3 apps; ver `README.md` — seção "UI nos três apps" — e `.opencode/memory/frontend.md` "Fase 4")
2. Render boundary (estados async) com `render-boundary`/`render-query-boundary` no lugar de loading/error parciais
3. Criar a estrutura da feature nos três apps

### Estrutura padrão (espelhada nos 3 apps)

Globais vão em `components/<nome>/<nome>.<ext>`; irmãos da rota ficam em `<rota>/_components/`.

```
Next       app/<rota>/                Nuxt     app/pages/<rota>/            SvelteKit src/routes/<rota>/
├── page.tsx                           ├── index.vue (ou <rota>.vue)         ├── +page.svelte
├── layout.tsx (se privada, em        ├── layouts/private.vue (app-wide)    └── _components/...  (mais +page.server.ts
│   (private)/ chama verifySession)   └── _components/...                   │    se houver load; (private)/+page
├── _components/                                                             │    é protegido por (private)/+layout.svelte)
│   └── <Feature>.tsx
└── loading.tsx / error.tsx (uso
    pontual; preferir render-boundary)
```

- Imports: `_components/` irmãos por **caminho relativo** (nos 3 apps); globais por alias/auto-import (Nuxt auto-importa com `pathPrefix: false`; SvelteKit `$lib/components/...`).
- Data fetching canônico por app: React Query (Next), `useAsyncData`/`useFetch` (Nuxt), load em `+page.server.ts` (SvelteKit). Nunca fetch solto em `onMount`/`onMounted`.
- Motion: tokens de `packages/design-tokens/src/motion.css` (utilities `duration-slow`/`ease-entrance`) + `tw-animate-css` para micro-entradas; transição de rota já existe — não recriar.

## Convenções deste projeto

- **Gerenciador de pacotes**: `pnpm` (nunca npm/yarn); gates: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` (`prettier --check .`)
- **Stack por app (mesma arquitetura)**: Next 16 + React 19 + Mantine v9 + Tabler Icons / Nuxt 4 + Vue 3 + `@nuxt/ui` v4 / SvelteKit 2 + Svelte 5 (runes) + skeleton-svelte v5 — todos com Tailwind CSS v4 + `design-tokens` (vai ficar em `packages/design-tokens`)
- **Dados**: GraphQL via `graphql-yoga` + Pothos no BFF (`packages/bff`); cliente tipado na camada `services/` de cada app
- **Validação**: contratos zod canônicos em `packages/schemas` (importar de lá; ver semanticas de `''` → null); forms: react-hook-form (Next), Nuxt/SvelteKit nativo/form lib do kit
- **Banco**: Prisma (`packages/db/...`? não — `server/db/prisma.ts` via `pnpm --filter @ia-task-manager/nextjs db:*`), use-cases em `server/modules/*/use-cases/`, DI pelo composition root `server/shared/container.ts`
- **Estilo de código**: single quotes, sem semicolon, trailing comma all (prettier)
- Verificar como arquivos similares existentes resolvem (ex.: `components/form-login/form-login.<ext>`, `bff/pothos/modules/todo/`, `server/modules/todos/use-cases/`) antes de criar novo padrão
