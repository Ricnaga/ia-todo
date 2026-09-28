---
name: sveltekit-patterns
description: Use when working with SvelteKit (full-stack Svelte framework): load functions (+page.server.ts, +layout.server.ts), form actions + use:enhance, hooks.server.ts, $app/state vs $app/stores, $env (static/dynamic public/private), server-only modules, SSR/prerender/SSG/SPA, adapters, routing, error handling, SvelteKit 3 changes (refreshAll, error(status, message)). Trigger on keywords like "sveltekit", "svelte kit", "+page.server.ts", "+layout.server.ts", "+server.ts", "+error.svelte", "+page.ts", "load", "form action", "use:enhance", "applyAction", "fail", "invalidateAll", "refreshAll", "goto", "$app/state", "$app/stores", "$app/navigation", "$app/forms", "$app/server", "hooks.server", "handleFetch", "handleError", "$env", "PUBLIC_", "server-only", "adapter", "prerender", "ssr", "shallow routing".
metadata:
  audience: frontend-engineer, staff-engineer
  scope: sveltekit
  mode: implementation-review
---

# SvelteKit Patterns — Implementação e Revisão

Referência de padrões para **SvelteKit** (framework full-stack Svelte 5) para **implementação** (frontend-engineer) e **revisão** (staff-engineer). Validado contra a documentação oficial (`svelte.dev/docs/kit`) e práticas da comunidade (2026; SvelteKit v2 estável + v3 em preview).

> Esta skill é uma referência de implementação e revisão, **não um conjunto de regras absolutas**. Use o bom senso contextual; quando um critério conflitar com o contexto real, documente a decisão.

## 1. Objetivo

Definir padrões para apps SvelteKit com Svelte 5 (runes) e TypeScript: data fetching via `load`, mutações via form actions, hooks, SSR/prerender e segurança — evitando que assistentes de IA gerem padrões mortos (fetch em `onMount`, `+server.ts` para mutação de form, `$app/stores`, `invalidateAll`).

> **Svelte puro (runes, componentes, snippets, stores)** é coberto por `svelte-patterns`. Esta skill complementa com o que é específico do SvelteKit (file-based routing, camada server, SSR).

## 2. Agentes autorizados

| Agente              | Papel                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `frontend-engineer` | Consulta antes de implementar ou refatorar páginas, load functions, actions, hooks ou rotas SvelteKit |
| `staff-engineer`    | Consulta durante revisões e auditorias de código SvelteKit                                            |

> **Acesso**: por contexto (trigger no `description`) — não há bloqueio por permissão. A pasta em que a skill vive indica **ownership** (quem a mantém), não audience. Agent fora do domínio deve delegar ao dono.

## 3. Estrutura: parts do SvelteKit

- `+page.svelte` / `+layout.svelte` — páginas/layouts.
- `+page.server.ts` — `load` + form `actions` **no servidor** (default; preferir).
- `+page.ts` — `load` universal (quando precisa rodar também no client, ex.: dados que dependem de estado do browser).
- `+layout.server.ts` / `+layout.ts` — loading de dados de layout.
- `+server.ts` — endpoints de API (GET/POST/PUT/PATCH/DELETE + `fetch` interno do server).
- `+error.svelte` — error boundary global/por rota.
- `+page.svelte` recebe dados via `$props()` tipada com `PageProps` de `./$types`.
- `$lib` — alias para `src/lib` (componentes, utils, stores).
- `src/hooks.server.ts` — middleware global (§7).
- Diretórios `server/` em qualquer nível marcam código **server-only** (§8).
- Componentes/arquivos podem ter sufixos: `+page.svelte` (client), `+page.server.svelte` (server-only), `.server.ts`, `.client.ts`.

## 4. Load functions — data fetching

**Regra**: `load` é a única fonte de busca de dados antes do render. **Nunca** buscar dados em `onMount` — quebra SSR e hidratação.

### 4.1 `+page.server.ts` (default)

```ts
// +page.server.ts
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ params, url, fetch, locals, cookies, depends }) => {
  const items = await (await fetch(`/api/items/${params.slug}`)).json()
  return { items, user: locals.user, pageTitle: `Items: ${url.searchParams.get('q')}` }
}

export const actions = {/* ver §5 */} satisfies Actions
```

- Receber `event` completo: `params`, `url`, `fetch`, `locals`, `cookies`, `request`, `depends`, `platform`, `route`, `isDataRequest`, `setHeaders`.
- Domínio de servidor (DB, secrets) **só aqui ou em `$lib/server`** — nunca em `+page.ts`.
- Validação de input sempre (ver `security-review`).

### 4.2 `+page.ts` (universal) — quando usar

Load universal roda server + client. Usar quando:

- O dado **já vem do browser** (localStorage, window, media query).
- Precisa retornar `plaintext-draggable`/não-sensitive e roda igual nos dois lados.
- Precisar de dados de `$app/state` no load.

⚠️ Nunca colocar segredos/DB em `+page.ts` — só `+page.server.ts`/`$lib/server`.

### 4.3 Tipagem com `./$types`

```ts
import type { PageServerLoad, PageServerLoadEvent, Actions } from './$types'
import type { PageProps, LayoutProps } from './$types'
```

Componentes recebem `data`/`form` tipados:

```svelte
<!-- +page.svelte -->
<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

{#if data.user}<p>Olá, {data.user.name}</p>{/if}
```

- `LayoutProps` para `+layout.svelte`; o retorno de `load` de layout vira `data` do layout e `data` filho.
- União de `data` de layout + página fica no tipo `PageData` gerado.

### 4.4 `depends`/`invalidate`

- `depends('app:items')` em `load` → `invalidate('app:items')` re-executa só os loads que dependem dele.
- `invalidateAll()` re-executa todos os loads da navegação ativa (legado — ver `refreshAll` no SvelteKit 3, §10).
- `goto(url, { invalidateAll: true })` equivalente em navegação.

## 5. Form actions + progressive enhancement

Form actions (`+page.server.ts`) são o padrão para **mutações** — nunca criar `+server.ts` POST só para formulário.

```ts
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData()
    const email = String(data.get('email') ?? '')
    const password = String(data.get('password') ?? '')

    if (!email || !password) {
      // erro HTTP 400 + payload retornado ao form (preserva input digitado)
      return fail(400, { email, missing: true })
    }

    cookies.set('sessionid', '...', { path: '/' })

    // sucesso → redirect 303 (nunca retornar página em action)
    redirect(303, '/dashboard')
  },
} satisfies Actions
```

```svelte
<!-- +page.svelte com use:enhance (progressive enhancement) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<form method="POST" use:enhance>
	<input name="email" value={form?.email ?? ''} />
	{#if form?.missing}<p class="error">Campo obrigatório</p>{/if}
	<button type="submit">Entrar</button>
</form>
```

Padrões:

- `use:enhance` faz POST sem refresh e gerencia `applyAction` automaticamente (redirects, `fail`, re-run de loads).
- Actions **nomeadas** (`login`, `register`) quando há múltiplas por página; `<button formaction="?/login">`.
- Para eventos custom (otimista, refresh extra): handler manual com `applyAction` + `deserialize` de `$app/forms` — `JSON.parse` não trata `Date`/`BigInt` retornados por actions.
- Retorno de ação **não persiste** após reset do form — só `form` entrega no submit. Evite depender do retorno em `use:enhance`; prefira re-run de `load`.
- Sucesso sem navegação → `{ success: true }`; com redirecionamento → `redirect(303)`.
- `cancel()` dentro de `use:enhance` para parar a submissão.
- Acessibilidade: mensagens de erro com `aria-live`/`role="alert"`; manter foco no campo inválido.

## 6. `$app/state` vs `$app/stores`

`$app/stores` está **deprecado desde SvelteKit 2.12**. Em código novo/runes, usar **`$app/state`** — objetos reativos diretos, **sem prefixo `$`**.

```svelte
<script lang="ts">
	import { page, navigating } from '$app/state';
</script>

<h1>{page.data.title}</h1>
<p>URL atual: {page.url.pathname}</p>
{#if navigating}Carregando…{/if}
```

- `page` expõe: `url`, `params`, `route`, `id`, `status`, `error`, `data`, `state`, `form`.
- `$app/stores` (com `$page`): **somente** para compatibilidade com libs externas que ainda usam stores.

## 7. Hooks — middleware global

`src/hooks.server.ts` é o middleware da app: `handle` (auth guard), `handleFetch` (SSR fetch próprio), `handleError`, `reroute`. `src/hooks.client.ts` para `handleError` client.

```ts
// src/hooks.server.ts
import { redirect } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('sessionid')
  event.locals.user = sessionId ? await getSessionUser(sessionId) : null

  // guarda de rota protegida
  if (!event.locals.user && event.url.pathname.startsWith('/admin')) {
    redirect(303, '/login')
  }

  return resolve(event)
}
```

- `event.locals` — **_nunca_** confiar em dados de locals sem re-validação (segurança); autenticar em cada request.
- `handleFetch` — reescrever URL para API interna quando o fetch é no servidor/prerender (evita round-trip pela internet).
- Não colocar lógica pesada no `handle` para toda rota; optar por nível em `load` quando só afeta algumas rotas.

## 8. Variáveis de ambiente (`$env`) e server-only modules

### 8.1 `$env`

Todos os módulos `$env` são estáticos (build) ou dinâmicos (runtime), e `private`/`public` por prefixo `PUBLIC_`.

```ts
// Server-only
import { API_KEY } from '$env/static/private' // injetada no build
import { env } from '$env/dynamic/private' // runtime (não usa PUBLIC_)

// Client-safe (qualquer lugar)
import { PUBLIC_BASE_URL } from '$env/static/public'
import { env } from '$env/dynamic/public'
```

- ❌ Nunca importar `$env/.../private` em código client — quebra o build.
- ❌ Nunca expor segredos no client: prefixo `PUBLIC_` é o único visível.
- Alternativa SvelteKit 3/experimental: `src/env` + `defineEnvVars` em `@sveltejs/kit/env`.

### 8.2 Server-only modules

- Diretórios chamados `server` (qualquer profundidade) são **exclusivos de servidor**; import de cliente gera erro de compilação.
- `$lib/server/` para DB, auth, tokens — nunca importar em `.svelte`/client.
- Contratos: `satisfies Actions`, `PageServerLoad` etc. sempre em arquivos `+*.server.ts`.

## 9. Erros e redirects

- `throw error(status, message, { ...details })` em `load`/`actions` → capturar/tratar em `+error.svelte` (`$props().error`).
- `redirect(status, path)` — no `load`/action/`handle` (não capturar o throw).
- `fail(status, payload)` em actions: validação/erro de form (payload tipado).
- Componente: estado `error: string | null` + máquina de UI (`'idle' | 'loading' | 'success' | 'error'`).
- Nunca capturar e engolir: logar e exibir; resposta degradada sempre que possível.
- `handleError` global: logar no server; **nunca** vazar stack para o client (mensagens amigáveis + `App.Error` tipado).

## 10. SvelteKit 3 (preview) — mudanças a observar

Quando SvelteKit 3 estável for o alvo, aplicar:

- **`refreshAll()`** substitui `invalidateAll()` (deprecado). `refreshAll({ includeLoadFunctions: true })` re-executa `load`s ativas da página.
- **`error(status, message, {...})`** — assinatura antiga `error(status, {...})` deprecada; `message` obrigatória.
- **Shallow routing** embutido em `goto(url, { state, persistState })` (substitui `pushState`/`replaceState`).
- `$app/manifest` e `$app/service-worker` novos; `$service-worker` movido.
- `goto`'s `noScroll`/`keepFocus` colapsam em `reset`.

## 11. SSR, prerender, SSG e SPA

- **`prerender = true`** (em `+page.ts`, `+layout.server.ts` ou `svelte.config.js`) para rotas estáticas publicáveis ao build (talks, blogs).
- **`ssr = false`** em `+page.ts` para páginas somente client (dashboard interno, tools) — usar com critério.
- `trailingSlash`, `entries` para rotas parametrizadas no prerender.
- União possível na mesma app: páginas SSR + rotas prerenderizadas + SPA isoladas.
- Mover para CDN/edge com adapter Node/static conforme target (§12).

## 12. Adapters (deploy)

- `@sveltejs/adapter-auto` detecta platform — usar para deploy em Vercel/Netlify/Cloudflare.
- `@sveltejs/adapter-node` — servidor Node standalone (`OUTPUT` custom).
- `@sveltejs/adapter-static` — SSG/SPA (com `prerender`; requer `fallback` para SPA).
- `@sveltejs/adapter-cloudflare` / `adapter-netlify` — platform-specific (KV, functions).
- Variáveis por ambiente sem segredo em client (`PUBLIC_*` inject) — ver `$env`.
- Health check (`/healthz`) e graceful shutdown ao usar adapter-node (ver `devops-workflow`).

## 13. Performance

- `load` paralelo é automático entre layouts/páginas (não serializar com `await` dentro do arrow — promise top-level não é aguardada pela carga).
- Cache: `setHeaders` (cache-control) em rotas estáticas/prerenderizadas; `depends`/`invalidate` para invalidação granular.
- Redução de payload: minimizar dados retornados por `load` (evitar objetos inteiros quando só campos são necessários).
- `use:enhance` + `load` para UI otimista sem refresh.
- Pré-carregar rotas com `preloadCode`/`preloadData` (links `data-sveltekit-preload-data="hover"`).
- Otimizar imagens (formatos modernos, lazy loading, dimensões) e servir assets via `static/`/CDN.
- Evitar `$effect` desnecessário em componentes de página (ver `svelte-patterns`).

## 14. Testing (load, actions e páginas)

```ts
// src/routes/items/+page.server.test.ts
import { describe, it, expect } from 'vitest'
import { load, actions } from './+page.server.js'

describe('load items', () => {
  it('retorna itens do usuário', async () => {
    const result = await load({
      params: { slug: 'a' },
      locals: { user: fakeUser },
      fetch,
      url,
      cookies,
    } as any)
    expect(result.items).toHaveLength(2)
  })
})
```

- Montar `RequestEvent` com mocks mínimos (`params`, `locals`, `cookies`, `url`, `fetch`, `platform`).
- Testar actions enviando `new Request(url, { method: 'POST', body: formData })`.
- Testar comportamento de formulário no client com Testing Library/Svelte (ver `frontend-testing-strategy`).
- Rodar `svelte-check` como gate de tipos (.svelte/`./$types`).

## 15. Sinais de Alerta na Revisão (code smells)

| Signal                                           | Ação                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| Data fetching em `onMount`                       | `load()` em `+page.server.ts` / `+page.ts`                          |
| `+server.ts` POST para mutação de form           | Form actions em `+page.server.ts`                                   |
| `$app/stores` novo                               | `$app/state`                                                        |
| `invalidateAll()` novo (v3)                      | `refreshAll()` (SvelteKit 3)                                        |
| `error(status, {...})` sem message (v3)          | `error(status, message, {...})`                                     |
| Segredo em `+page.ts` / client                   | Mover para `+page.server.ts` / `$lib/server`                        |
| Import de `$env/*/private` em client code        | Mover para `+*.server.ts` / `$lib/server`; usar `PUBLIC_` no client |
| `event.locals.user` sem re-validação por request | Autenticar em cada request (hooks/load)                             |
| Retornar página em action (sem `redirect`)       | `redirect(303, ...)` após sucesso                                   |
| Validação de form ausente (`fail` não usado)     | `fail(status, payload)` com payload tipado                          |
| Payload gigante de `load`                        | Retornar só campos necessários                                      |

## 16. Referências cruzadas

- **`svelte-patterns`** — Svelte 5 puro: runes, snippets, stores, componentes (base desta skill).
- **`frontend-patterns`** — consistência visual, UI Kit, semântica, acessibilidade, responsividade.
- **`typescript-best-practices`** — interfaces, discriminated unions, type guards.
- **`error-handling`** — hierarquia de erros, Result pattern, retry.
- **`security-review`** — validação de input, auth, sanitização em endpoints/actions.
- **`staff-engineer/code-review-checklist`** — checklist genérico de revisão (cross-cutting).
- **`frontend-testing-strategy`** — detalhes de Vitest/Testing Library.
