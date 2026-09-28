---
name: nuxt-patterns
description: Use when working with Nuxt 4 (full-stack Vue framework), pages, layouts, useFetch/useAsyncData/useNuxtData/refreshNuxtData, definePageMeta, serialização de dados, server routes (Nitro), Server Components, auto-imports, composables, middleware, plugins, useHead/useSeoMeta, shared/, modules, nuxt.config or any Nuxt-specific patterns. Trigger on keywords like "nuxt", "nuxt 4", "app/", "pages", "useFetch", "useAsyncData", "useNuxtData", "refreshNuxtData", "clearNuxtData", "useSeoMeta", "useHead", "definePageMeta", "navigateTo", "server/api", "nitro", "server component", "auto-import", "composable", "middleware", "plugin", "module", "$fetch", "shared/", "runtimeConfig", "defineNuxtConfig".
metadata:
  audience: frontend-engineer, staff-engineer
  scope: nuxt
  mode: implementation-review
---

# Nuxt Patterns — Implementação e Revisão

Referência de padrões para Nuxt 4 (Vue full-stack framework) para **implementação** (frontend-engineer) e **revisão** (staff-engineer). Validado contra a documentação oficial do Nuxt 4.x e práticas da comunidade (2026; Nuxt 3 em EOL desde 31/07/2026 — código novo deve mirar Nuxt 4).

> Esta skill é uma referência de implementação e revisão, **não um conjunto de regras absolutas**. Use o bom senso contextual; quando um critério conflitar com o contexto real, documente a decisão.

## 1. Objetivo

Definir padrões para aplicações Nuxt 4: estrutura de `app/`, data fetching universal, Server Components, rotas de API (Nitro), auto-imports, middleware, plugins e módulos — sempre **fortemente tipado** com TypeScript.

> Vue 3 em si é coberto por `vue-patterns`. Esta skill complementa com o que é específico do Nuxt (SSR/SSG, file-based routing, camada server).

## 2. Agentes autorizados

| Agente              | Papel                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `frontend-engineer` | Consulta antes de implementar ou refatorar páginas, composables, data fetching ou rotas Nuxt |
| `staff-engineer`    | Consulta durante revisões e auditorias de código Nuxt                                        |

> **Acesso**: por contexto (trigger no `description`) — não há bloqueio por permissão. A pasta em que a skill vive indica **ownership** (quem a mantém), não audience. Agent fora do domínio deve delegar ao dono.

## 3. Diretório `app/` (Nuxt 4) / estrutura base

Nuxt 4 move tudo que é app para `app/`; `server/`, `public/`, `modules/` e `nuxt.config.ts` ficam na raiz. Nuxt 3 (estrutura antiga plana) está em EOL — **código novo usa `app/`** (o Nuxt auto-detecta a estrutura antiga, mas não para projetos novos).

```
app/
├── app.vue              # Root component (opcional)
├── error.vue            # Error boundary global
├── pages/               # File-based routing
│   ├── index.vue
│   └── items/[id].vue
├── layouts/             # Layouts (default.vue, custom.vue)
├── components/          # Auto-imported components
├── composables/         # Auto-imported composables
├── stores/              # Pinia (setup stores)
├── types/               # Tipos compartilhados
├── utils/ ou lib/       # Helpers puros (auto-importados)
├── middleware/          # Route middleware
├── plugins/             # Client-side code
└── assets/              # CSS, imágenes
server/
├── api/                 # API routes (Nitro): server/api/<recurso>/
└── utils/               # Server-only helpers
shared/
└── ...                  # Código compartilhado app + server (Nuxt 4)
public/                   # Assets estáticos (robots.txt, favicon…)
nuxt.config.ts           # Config tipada
```

- `shared/` (novo no Nuxt 4): código usado **tanto no client quanto no server** (types, schemas zod, utils puros) — importado via `#shared`. Para algo exclusivo de server use `server/`; exclusivo de client fica em `app/`.
- `public/` substitui `static/` (Nuxt 3).

### 3.1 Subpastas, colocation e nomenclatura

Organização **por tipo** + **colocation** de arquivos específicos de uma feature — a parte Vue herda as convenções de folder de `vue-patterns`.

- **Páginas** (`app/pages/`) = rotas/views; **componentes** (`app/components/`) = reuso. Mapeamento agent: `hooks/` → `composables/`, `lib/` → `utils|lib/`.
- **Colocation:** quando um componente precisa de estado/lógica própria, agrupar numa pasta (auto-import continua valendo para subpastas).

```
app/components/UserCard/
├── UserCard.vue          # componente (PascalCase)
├── useUserCard.ts        # composable da feature
└── UserCard.test.ts
```

- **Auto-imports (obrigatório):** `app/components/` e `app/composables/` são importados automaticamente na template. Regras:
  - Arquivos em **kebab-case** (ex.: `use-user.ts` → composable `useUser`).
  - **Nomes únicos** — colisão de nome entre dois componentes/composables auto-importados é conflito silencioso; manter `.client.vue`/`.server.vue` para variantes e nomes distintos.
  - Prefixar pasta de página com `_` não é padrão Nuxt (isso é convenção do Next.js); em Nuxt, pastas de página que não são rotas ficam fora de `pages/` (ex.: em `components/`).

- ✅ Tipos de recursos em `app/types/<recurso>.ts`; tipos só de uma feature colados junto a ela.
- ✅ `server/api/<recurso>/<recurso>.get.ts` etc. — um diretório por recurso.
- ✅ Nomenclatura: arquivos kebab-case, componentes PascalCase, composables `useNome`, stores `useNomeStore`.
- ❌ Não criar `components/common/` com pastas de tipo para um único arquivo; colocar onde é usado e extrair só no 3º uso.

## 4. Páginas e roteamento

- File-based: `app/pages/items/[id].vue` → `/items/:id`.
- `navigateTo()` para redirecionamentos programáticos; `<NuxtLink>` para links nas views.
- 404: `app/error.vue`. Página custom: `definePageMeta({ layout: 'custom' })`.
- **Route groups** (Nuxt 4): diretórios `(nome)` agrupam páginas sem afetar a URL — `app/pages/(marketing)/about.vue` → `/about`.
- **Transições multiplataforma**: View Transitions API é **estável no Nuxt 4** (`experimental.viewTransition` não é mais necessário) — definir transições nas rotas com `<NuxtLink>`, `definePageMeta({ pageTransition })`, etc.
- Pré-carregamento de links: `<NuxtLink :prefetch-on="{ visibility: true, interaction: true }">` (estável no Nuxt 4) e `experimental.defaults.nuxtLink.prefetchOn` no config.

```vue
<!-- app/pages/items/[id].vue -->
<script setup lang="ts">
import type { Item } from '~/types'

interface RouteParams {
  id: string
}

const route = useRoute()

const { data: item } = await useFetch<Item>(`/api/items/${route.params.id}`, {
  key: `item-${route.params.id}`,
})
</script>

<template>
  <div>
    <h1>{{ item?.name }}</h1>
    <p>{{ item?.description }}</p>
  </div>
</template>
```

- ✅ Usar `key` **única baseada nos params** em páginas dinâmicas (evita cache enganoso entre rotas).
- ✅ `definePageMeta` para layout, middleware e título.

## 5. Data Fetching

### 5.1 `useFetch` / `useAsyncData`

Usar composables universais (SSR + client). Disponíveis: `useFetch`, `useAsyncData`, `$fetch`, `useLazyFetch`, `useLazyAsyncData`.

```ts
// SSR: busca no servidor, hidrata no client
const { data, status, error, refresh } = await useFetch<User[]>('/api/users', {
  // opcional: revalidate no servidor
  // server: false, // client-only
  watch: [search.value], // busca reativa
})
```

```ts
// useAsyncData com lógica custom (mais controle)
const { data } = await useAsyncData('items', async () => {
  return await $fetch('/api/items', { query: { search } })
})

// NOTA: sempre passar key explícita quando a página é dinâmica
const { data } = await useAsyncData(route.params.slug, async () => {
  return await $fetch(`/api/items/${route.params.slug}`)
})
```

- ✅ Preferir `useFetch` (encapsula `useAsyncData` + `$fetch`) para chamadas a API Nuxt.
- ✅ `key` explícita e exclusiva (params de rotas dinâmicas).
- ✅ Tipar resposta: `useFetch<Type>`.
- ✅ `refresh()` para revalidar, `clearNuxtData` para limpar cache.
- ✅ **Nuxt 4**: dados vêm em `shallowRef` por padrão — se precisar reatividade profunda do payload, usar `deep: true` (ou `deep` na opção de `useAsyncData`).
- ✅ **Nuxt 4**: chamadas `useFetch` com a **mesma `key`** deduplicam (uma única requisição compartilhada) — use isso a favor em página + componentes aninhados.
- ✅ `useNuxtData(key)` lê o valor cacheado (útil p/ optimistic updates); `refreshNuxtData(['key'])` revalida por key.
- ❌ Não duplicar fetch entre página e componentes aninhados (cache de key compartilhada resolve; use o mesmo key).

### 5.2 Data sensível vs client-only

- `server: false` **não** esconde dados do client — todo payload navega para hidratação. Alternativas: chamadas server-side em Server Components (`server/`), ou expor apenas o que a UI precisa (mascara/derivação no server antes de retornar).
- Busca que não deve bloquear a navegação (progressive enhancement): `useLazyFetch`/`useLazyAsyncData` + `watch`/`refresh`.
- SPA pura quando SSR/SSG não agregam valor: `ssr: false` no `nuxt.config`.

### 5.3 Revalidação / cache

- `refresh()` manual no client; `refreshNuxtData(key)` global por key.
- `useAsyncData` com `getCachedData` para cache compartilhado custom.
- `transform`/`pick` no `useAsyncData` para reduzir payload e normalizar.
- **Nuxt 4**: `sharedPrerenderData` é estável (dedup de fetches idênticos no prerender) — payloade de dados repetido entre páginas é compartilhado no build.
- `navigateTo` + `refresh` quando necessário após mutação; optimistic updates via `useNuxtData`.

## 6. Server routes (Nitro API)

### 6.1 API routes em `server/api/`

```ts
// server/api/items/index.get.ts
export default defineEventHandler(async (event) => {
  const items = await fetchItems()
  return items
})
```

```ts
// server/api/items/[id].put.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id || !body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  return await updateItem(id, body)
})
```

- ✅ `getRouterParam`, `readBody`, `getQuery` tipados do `h3`/Nitro.
- ✅ Sempre **validar payload** (schema/zod) antes de usar.
- ✅ Tipo de retorno explícito — o client tipa por `$fetch<Response>` ou composable.
- ✅ `server/` jamais importa client code; pode acessar `#imports` server-only.
- ❌ Nunca expor secrets no response.

### 6.2 Validation com zod/nuxt schema

```ts
import { z } from 'zod'

const CreateItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(0),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = CreateItemSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: parsed.error.message })
  }

  return await createItem(parsed.data)
})
```

### 6.3 Server-only secrets

- `runtimeConfig` em `nuxt.config` (com `.env` as `NUXT_*`). Nunca hardcoded secrets; nunca expor secrets via `$fetch` public routes.
- `useRuntimeConfig(event)` no servidor; `publicRuntimeConfig` acessível no client.
- ⚠️ `shared/` é importável do **client e do server** — nunca colocar secrets lá; usar `runtimeConfig` private + leitura só em server code.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiKey: '', // lido de NUXT_API_KEY no servidor
    public: {
      baseUrl: '', // NUXT_PUBLIC_BASE_URL — exposto no client
    },
  },
})
```

## 7. Server Components (RSC-like no Nuxt)

Nuxt suporta server components via layout `.server.vue` (experimental/progressivo) para reduzir JS no client; `server: true` no componente ou nome `.server.vue`.

```vue
<!-- Dashboard/Stats.server.vue — renderizado no servidor -->
<script setup lang="ts">
const stats = await useServerQuery(...);
</script>

<template>
  <div>
    <span>Usuários ativos: {{ stats.activeUsers }}</span>
  </div>
</template>
```

- ✅ Com Server Components, o payload resultante é enviado, código do componente NÃO vai ao client (hash render).
- ❌ Server Components não podem ter interatividade client — para interação, dividir em child client component.

## 8. Auto-imports e composables

- `composables/` e `utils/` (em `app/`) são **auto-importados** — nome arquivo kebab-case, função exportada vira composable disponível sem import.
- Componentes em `app/components/` são auto-importados na template.
- **Aliases no Nuxt 4**: `~/` e `@/` apontam para `app/`; `#shared` para o diretório `shared/`; `#imports` para os auto-imports registrados.

```ts
// app/composables/useUser.ts
export async function useUser() {
  const { data, refresh } = await useFetch<User>('/api/me', { key: 'current-user' })

  return { user: computed(() => data.value), refresh }
}
```

- ✅ Retornar `computed`/refs prontos para template.
- ✅ Fornecer tipos; composable universal pode usar `useNuxtApp()`, `useRoute()`, `useFetch` (SSR-safe).
- ❌ Não duplicar composable com nome de outro auto-import (conflito de nomes silencioso).
- ❌ Composable não deve depender do client (não usar `window`/`document` no topo) se for usado no server — usar `onMounted`/`createClientOnly`.

## 9. Middleware

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUser()

  if (!user.value) {
    return navigateTo('/login')
  }
})
```

```vue
<!-- app/pages/account.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  // ou inline: defineNuxtRouteMiddleware ...
})
</script>
```

- ✅ Middleware nomeado em `app/middleware/` + referenciar em `definePageMeta`.
- ✅ Middleware global: nome `*.global.ts`.
- ❌ Não colocar lógica de autorização parcial devolvendo página não autorizada — redirecionar ou `throw createError({ statusCode: 403 })`.

## 10. Plugins

- `app/plugins/*.ts` rodam antes do app. Plugins client-only: sufixo `.client.ts`; server-only: `.server.ts`.
- `useNuxtApp()` fornece `$fetch`, `$pinia`, `$config`, etc.

```ts
// app/plugins/sentry.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // inicializa lib client (Sentry, analytics, etc.)
})
```

- ✅ Plugins só para inicialização de runtime (não lógica de página).
- ❌ Não colocar fetch de dados em plugins — usar composables/`useFetch` em páginas e componentes.
- ❌ Não sobrecarregar com fetch de dados — uso composables em páginas.

## 11. SEO / Head

```ts
// app/pages/items/[id].vue
const route = useRoute()

useSeoMeta({
  title: 'Items — My App',
  description: 'Lista de itens',
  ogTitle: 'Items',
})

useHead({
  htmlAttrs: { lang: 'pt-BR' },
})
```

- ✅ `useSeoMeta`/`useHead` no setup (SSR-safe). Melhor que alterar `head` via plug-in.
- ✅ Título/desc dinâmica por rota; `useHead` também dinâmico via computed.

## 12. Tipagem forte no Nuxt

- `nuxt.config.ts` com `defineNuxtConfig` (tipado).
- no Nuxt, `useFetch<Type>`/`useAsyncData<Type>` dão tipos ponta-a-ponta — o retorno dos server routes vira `DataT` no client quando tipado.
- Para rotas server: `H3Event` é tipado; retorne os dados tipados (e valide payloads com zod).
- `tsconfig.json` gerado por `nuxt generate`/`nuxt typecheck` — inclui tipos de auto-imposto.

```bash
npm run typecheck   # nuxt typecheck
```

- ✅ Sempre rodar `nuxt typecheck` antes de considerar a feature completa.
- ❌ Não usar `any` em retornos de server routes; exponha o tipo correto.

## 13. Tratamento de erros

- `throw createError({ statusCode, statusMessage, data })` no servidor.
- `app/error.vue` para exibir erros de navegação (500/404).

```vue
<!-- app/error.vue -->
<script setup lang="ts">
interface Props {
  error: { statusCode: number; message: string }
}

let { error } = defineProps<Props>()
</script>

<template>
  <div>
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <NuxtLink to="/">Voltar</NuxtLink>
  </div>
</template>
```

- ✅ Estado de erro por página: `data.value` + `error.value` de `useFetch` retornado.
- ❌ Não engolir erros; sempre degradar graciosamente.

## 14. Módulos e extensão

- Usar módulos para features transversais: `@nuxtjs/pinia`, `@nuxt/fonts`, `nuxt-icon`, `@nuxt/image`, etc.
- Modules escopados ao projeto → `modules/` dir padrão do Nuxt 4 (`app.modules.ts`).

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/pinia', '@nuxt/image'],
  app: {
    head: {
      titleTemplate: '%s · My App',
    },
  },
})
```

## 15. Sinais de Alerta na Revisão (code smells)

| Signal                                                   | Ação                                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `fetch` cru em vez de `useFetch`/`$fetch`                | Usar composables universais                                                      |
| `key` de `useAsyncData` ausente em página dinâmica       | Key única com params                                                             |
| Retornos de server route sem tipo / `any`                | Tipar resposta; validar payload                                                  |
| Payload de API sem validação                             | Validar com zod no `defineEventHandler`                                          |
| Secrets no response de API                               | Remover; usar `runtimeConfig`                                                    |
| Secrets em `shared/` ou client                           | Mover para `runtimeConfig` private; usar `NUXT_PUBLIC_*` só para o que é público |
| Estrutura Nuxt 3 plana (páginas na raiz) em projeto novo | Adotar `app/` (Nuxt 4); `server/`, `public/`, `modules/` fora do `app/`          |
| `data` com reatividade profunda desnecessária            | Nuxt 4 já usa `shallowRef`; não forçar `deep: true` sem motivo                   |
| Payload gigante de `useAsyncData`                        | `transform`/`pick` para reduzir e normalizar                                     |
| Lógica pesada no `<script>` de página                    | Extrair composables                                                              |
| Componente client fazendo fetch pesado desnecessário     | Considerar Server Component / server route                                       |
| Middleware sem `navigateTo`/`createError`                | Redirecionar/rejeitar explicitamente                                             |
| Busca duplicada páginas/componentes                      | Compartilhar `key` de cache                                                      |

## 16. Referências cruzadas

- **`vue-patterns`** — Vue 3 Composition API, `script setup`, Pinia, composables (base do Nuxt).
- **`frontend-patterns`** — consistência visual, UI Kit, semântica, acessibilidade, responsividade.
- **`typescript-best-practices`** — interfaces, type guards, discriminated unions.
- **`staff-engineer/code-review-checklist`** — checklist genérico de revisão (cross-cutting).
- **`error-handling`** — hierarquia de erros, createError, Result pattern, retry.
