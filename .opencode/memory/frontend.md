---
alwaysApply: true
---

# Memória de contexto — Frontend

> Contexto do projeto `ia-task-manager` para o opencode, lado de UI/frontend. Ver também [`backend.md`](./backend.md).
>
> **Monorepo pnpm + Turborepo com três apps de UI**, mesmos contratos (`@ia-task-manager/schemas`, `@ia-task-manager/bff`, `@ia-task-manager/server`):
>
> | App               | Stack                              | UI kit                             | Skills                                  |
> | ----------------- | ---------------------------------- | ---------------------------------- | --------------------------------------- |
> | `apps/nextjs/`    | Next.js 16 (App Router) + React 19 | Mantine v9                         | `react-patterns`, `nextjs-patterns`     |
> | `apps/nuxt/`      | Nuxt 4 + Vue 3                     | `@nuxt/ui` v4                      | `vue-patterns`, `nuxt-patterns`         |
> | `apps/sveltekit/` | SvelteKit 2 + Svelte 5 (runes)     | `@skeletonlabs/skeleton-svelte` v5 | `svelte-patterns`, `sveltekit-patterns` |
>
> `packages/design-tokens` é a fonte única de cor, espaçamento, tipografia, shadow e motion (CSS puro para Tailwind 4), com um adapter por UI kit (`adapters/mantine.css`, `adapters/nuxt-ui.css`, `adapters/skeleton.css`). **Nunca usar cor/espaço literal no app** — sempre o token.
>
> **Daqui para baixo, o app Next** (`apps/nextjs/`) é a referência, o mais maduro (`app/`, `components/`, `lib/`, `providers/`, `services/`). Os apps Nuxt e SvelteKit têm a mesma camada de `services/` (GraphQL + auth), as páginas públicas (`/`, `/login`, `register`) **e as 5 rotas privadas portadas** (`/dashboard` na fase 1, `/resumo` e `/busca` na fase 2, `/tarefas` e `/settings` na fase 3) — ver [Fase 1](#fase-1-privada-nuxt-e-sveltekit), [Fase 2](#fase-2-nuxt-e-sveltekit) e [Fase 3](#fase-3-nuxt-e-sveltekit). O núcleo e a API ficam em `packages/server` e `packages/bff`; os contratos zod em `packages/schemas`.
>
> O app consome os packages por nome via `transpilePackages` — eles publicam TS puro, sem build. O alias `@/*` do Next é exclusive do app. Lint e format passam pelo Turborepo, com uma config flat por app e Prettier único na raiz (ver [Tooling](#tooling-e-gates)).

## O que é o app

**ia-task-manager**: gerenciador de tarefas com assistência de IA. A IA não é um chat — é uma feature que estrutura, organiza e interpreta dados de tarefa.

Features de IA na UI (via Gemini, structured output validado por zod no server):

1. `suggestTodo` — rascunho solto vira tarefa estruturada (em `/tarefas`)
2. `summarizeDay` — resumo + sugestão de foco do dia (em `/resumo`)
3. `nlSearch` — busca em linguagem natural interpretada em critérios tipados (em `/busca`)

## Stack frontend

- **Next.js 16** (App Router) + React 19 + TypeScript strict
- **UI**: Mantine (core, dates, form, hooks, notifications) + Tabler Icons + Tailwind 4
- **Tema**: o Mantine é o dono da preferência (persiste em `mantine-color-scheme-value`, escreve `data-mantine-color-scheme` lido pelo `modes.css`, e o `ColorSchemeScript` do `app/layout.tsx` lê a mesma chave antes da pintura) — **não criar store para o modo**; `components/theme-switcher/theme-switcher.tsx` expõe as 3 opções (`auto`/`light`/`dark`) via `setColorScheme`, e o ícone do gatilho é CSS (`dark:hidden`/`hidden dark:inline`) para não dar hydration mismatch. Os defaults de notificação (`position="top-right"`, `autoClose=5000`, `limit=3`) vivem em `NOTIFICATION_POLICY` e são passados no container de `AppNotifications`, **não** em `Notifications.extend` e **não** em props no JSX, para o provider ficar livre para outros usos
- **Dono do tema por app**: Next = Mantine (`data-mantine-color-scheme`); Nuxt = `@nuxtjs/color-mode`, declarado direto em `nuxt.config.ts` e como dependência, escrevendo a classe `dark`; SvelteKit = `src/lib/color-mode.svelte.ts`, que escreve `data-mode` no `<html>` antes da pintura. Nenhum app depende do tema de outro, e o `modes.css` de cada um escuta o atributo que o seu dono escreve
- **Auth**: better-auth client (`services/auth/auth.client.ts` via `createAuthClient`); **sessão é estado do servidor, nunca do client** — o token fica em cookie httpOnly e o front guarda só o usuário, revalidando com a query GraphQL `me` (`useMeQuery`, `staleTime: 0` + `refetchOnMount`/`refetchOnWindowFocus`); o client do better-auth é usado **apenas** nos fluxos imperativos (signIn/signUp/signOut/linkSocial)
- **Data fetching**: @tanstack/react-query consumindo **GraphQL** (`/api/graphql`) via wrapper tipado em `services/graphql/base.ts`
- **Tabela**: @tanstack/react-table **v9** (`useTable` + `tableFeatures`, não `useReactTable`/`getCoreRowModel`). Features registradas explicitamente em `table-todo-list/todo-table-features.ts`; `sortFns` é um registry (só as chaves registradas são válidas). Cell/header renderizam via `<table.FlexRender />`. Doc local: `node_modules/@tanstack/react-table/skills/`
- **State**: nenhum state manager global — **server state é react-query**, UI state local é `useState`/`useForm`. Não instalar zustand/redux/pinia sem necessidade concreta. **zustand e `@mantine/dates` foram removidos** (0 imports, auditoria de 2026-09) e `@mantine/hooks` segue declarado com 0 imports — não usar como se fossem APIs disponíveis em código novo. `@tanstack/react-query-devtools` deixou a lista: é importado pelo `providers/react-query`
- **View state (filtro/ordenação) vai na URL**, não em store: `useSearchParams` + `router.replace(..., { scroll: false })`, com a lógica pura em `lib/todo/todo-filters.ts` (valida com zod, ignora param inválido) e o glue em `lib/todo/use-todo-filters.ts`. Padrão confirmado nos docs do Next em `dist/docs/01-app/02-guides/preserving-ui-state.md`
- **Formulários/validação**: padrão do projeto é `@mantine/form` com `schemaResolver` (Standard Schema, embutido no Mantine v9) + schemas zod v4 compartilhados em `lib/schemas` (ex.: `changePasswordSchema`). **Exceção conhecida:** `tarefas/_components/modal-todo-form` usa `react-hook-form` + `@hookform/resolvers` — as duas libs convivem; ao criar form novo, seguir o `@mantine/form` e não introduzir uma terceira via

## Páginas

Route groups: `(public)` = não autenticado; `(private)` = autenticado (verificado em `(private)/layout.tsx` via `verifySession()` e no `proxy.ts`).

- `/(public)/` — landing (CTAs: "Criar minha conta" → `/register`, "Entrar" → `/login`)
- `/(public)/login` — login (email+senha + OAuth) (`_components/form-login/form-login.tsx`); link "Crie uma agora" → `/register`; se logado, redirect → dashboard
- `/(public)/register` — cadastro manual (Nome + email + senha + OAuth) (`_components/form-register/form-register.tsx`); link "Já tem uma conta? Entrar" → `/login`; se logado, redirect → dashboard
- `_components/card-auth/card-auth.tsx` — Card wrapper (título + children) compartilhado pelas pages de `/login` e `/register`
- `_components/oauth-buttons/oauth-buttons.tsx` — `OAuthButtons`, botões de login social (Google/GitHub) compartilhados por `/login` e `/register`; exporta `type SocialProvider = 'google' | 'github'`; props `loading` e `onSocial` (só a apresentação — a chamada `signIn.social` fica nos forms)
- `/(private)/dashboard` — visão geral (saudação com primeiro nome + atalhos)
- `/(private)/tarefas` — CRUD + suggestTodo (`_components/table-todo-manager` + `modal-todo-form` + `modal-ai-suggest`)
- `/(private)/resumo` — summarizeDay
- `/(private)/busca` — nlSearch
- `/(private)/settings` — Perfil (nome/imagem + email), Segurança (trocar senha), Contas vinculadas (link/unlink Google/GitHub), Sessões ativas (revogar sessão / outras sessões)

## Páginas públicas nos 3 apps

Portadas dos Next para `apps/nuxt` e `apps/sveltekit` com paridade de comportamento (mesmos textos, placeholders, mensagens de toast e regras zod). Cada app tem `paths`/`TPath` próprio com as **8 rotas**: Next (`lib/constants/router-paths.ts`), Nuxt (`app/lib/constants/paths.ts`), SvelteKit (`src/lib/constants/paths.ts`) — as 4 públicas desde a fase pública e as 4 privadas (`tarefas`, `resumo`, `busca`, `settings`) desde a fase 1.

- **Guard nas 2 direções nos 3 apps** (cookie `better-auth.session_token` no SSR): rota privada sem cookie → `/login?next=<path>` (pathname codificado) e `/login`/`/register` com cookie → `/dashboard`. Next: `proxy.ts`; Nuxt: `app/middleware/auth.global.ts` (`import.meta.server` + `navigateTo`); SvelteKit: `src/hooks.server.ts` (`PROTECTED_ROUTES` com match exato/prefixo, 303). A sessão real (usuário) é conferida no layout privado de cada app — ver a seção da fase 1.
- **Handler REST do better-auth** montado nos 3 (`auth` de `@ia-task-manager/server/auth`): Next `app/api/auth/[...all]/route.ts`, Nuxt `server/api/auth/[...all].ts` (`toWebRequest`/`sendWebResponse`, mesmo padrão do `server/api/graphql.ts`), SvelteKit `src/routes/api/auth/[...all]/+server.ts` (`GET`/`POST` como o `toNextJsHandler`). Smoke test: `POST /api/auth/sign-in/email` com credencial errada devolve `401 INVALID_EMAIL_OR_PASSWORD` (se vier 500, o DB não subiu).
- **Ícones: Tabler nos 3, sempre lib — nunca SVG à mão.** Next `@tabler/icons-react`; Nuxt Nuxt Icon + `@iconify-json/tabler` (strings `i-tabler:sparkles`, via `UIcon`/prop `icon` dos componentes Nuxt UI); SvelteKit `@tabler/icons-svelte` (`<IconSparkles size={18} />`, mesmo nome do React).
- **Toast**: contrato único `notifyError(title)(error)` + `notifySuccess(title, message)` com `toErrorMessage`, em `lib/utils/notifications.ts` de cada app — só a implementação muda (Mantine `notifications.show`; Nuxt `useToast()` dentro de `useNotifications()` porque `useToast` é composable; SvelteKit `createToaster()` de skeleton-svelte em `lib/toast.ts` + `<Toaster />` montado no `+layout.svelte`).
- **Sem header nas páginas públicas** (paridade com o Next): só o card. `ColorModeToggle` **saiu dos 2 apps** — o tema virou `ThemeSwitcher` de 3 opções dentro do shell privado.
- **Landing**: CTAs só no hero. Os cards de feature **não têm botão/rota** nos 2 apps (paridade com o Next); badge e diagrama da arquitetura são por app ("Nuxt 4 · Vue 3 · …" / "SvelteKit 5 · Svelte 5 · …", `UI ──(useAsyncData|fetch)──▶ GraphQL`).
- **Formulários**: Nuxt usa `UForm` + schema zod (Standard Schema, os erros saem do `UFormField`, `validateOn` default input/blur/change); SvelteKit fica em HTML semântico + `safeParse` + `z.flattenError` — o Skeleton **não** tem componentes de form, só classes (`input`, `label-text`, `btn`, `preset-*`, `hr`). Links e `goto` precisam de `resolve()` do `$app/paths` (regra `svelte/no-navigation-without-resolve`) e `callbackURL` é tipado como `TPath` para `resolve()` aceitar (ele só aceita pathnames conhecidos; o valor em runtime passa direto).
- **`/dashboard` é a tela real de atalhos** nos 2 apps (saudação com primeiro nome + 3 cartões + atalho para configurações), lendo `me` do layout privado — ver a seção da fase 1.

## Fase 1 privada (Nuxt e SvelteKit)

Shell + guard + dashboard portados com paridade do Next; `tarefas`, `resumo`, `busca` e `settings` são placeholders (título + cartão de construção) até as fases 2 e 3. Usuário de smoke em dev: `smoke-nuxt@ia.dev` / `SenhaForte123!` (mesmo SQLite, a sessão vale nos 3 apps).

- **Sessão real no layout privado, em 2 camadas** (igual ao Next): sem cookie → redirect do guard com `next`; com cookie → `me` no load do layout, e `null`/`UNAUTHENTICATED` → redirect de novo. Nuxt: `app/layouts/private.vue` com `useMeQuery()` + `definePageMeta({ layout: 'private' })` nas 5 páginas; SvelteKit: `src/routes/(private)/+layout.server.ts` com `fetchMe(fetch)` (`me` tem `skipTypeScopes` → sem sessão devolve `null`, sem erro de GraphQL). Erros de infra viram a página de erro, **não** redirect.
- **Erro global nos 2 apps, paridade de texto**: 404 → "Página não encontrada" + "Voltar ao início"; demais → "Erro ao carregar" + tentar novamente (Nuxt `clearNuxtData` + `clearError`; SvelteKit `invalidateAll()`). No SvelteKit o `+error.svelte` fica na **raiz** (não no grupo `(private)`) e troca o shell inteiro — é o comportamento esperado, igual ao Next. `message` do erro só em dev; componente compartilhado `ErrorState` (`role="alert"`, `btn preset-tonal-error`).
- **Shell**: Nuxt `app/layouts/private.vue` (`UHeader`/`USidebar`/`UNavigationMenu`/`UDropdownMenu` + `<NuxtPage />` + `NuxtLoadingIndicator` no `app.vue`); SvelteKit `src/lib/components/nav-shell/nav-shell.svelte` (folder-per-component desde a Fase 4) montado no `+layout.svelte` do grupo — header `sticky z-40 h-14`, sidebar `hidden md:flex`, **barra horizontal rolável no mobile sem drawer** (decisão do usuário), menu de conta, e o indicador de navegação (`bg-accent`) no `+layout.svelte` raiz.
- **Menu da conta (SvelteKit)**: `Menu` do Skeleton com `onSelect` no **root** — `invokeOnSelect` lê `context.get("highlightedValue")`, então `.click()` sintético **não** dispara `onSelect`; no smoke usar mouse real (CDP). `sign-out` → `authClient.signOut()` + `goto(resolve(LOGIN), { invalidateAll: true })` (o item não tem href; `goto` manual).
- **Tema com 3 opções** (Sistema/Claro/Escuro) nos 2 apps: `ThemeSwitcher` (Nuxt `colorMode.preference`; SvelteKit `Menu.OptionItem type="radio"` com `colorMode.preference` + `setPreference`). SvelteKit: `lib/color-mode.svelte.ts` guarda `preference` (`auto|light|dark`), listener de `matchMedia` só quando `auto`, e o `app.html` espelha a mesma lógica no script inline para não piscar no load. `ColorModeToggle` foi removido.
- **Skeleton (SvelteKit)**: componentes headless — estilizar com as nossas classes `btn`, `btn-icon` (+ `-sm/base/lg`), `preset-tonal`, `preset-tonal-error`, `card` (só radius/hover; padding e border são nossos). `Menu.ItemGroupLabel` **exige** `Menu.ItemGroup` pai (sem contexto dá `TypeError` no SSR); `Menu.Content` precisa de `z-50` (o `--z-index` é copiado do computed do próprio content) com header em `z-40`; `ItemIndicator` `hidden data-[state=checked]:block` sobre `Menu.Item` (que já sai com `hidden` quando unchecked). Ícones tipados com `import type { Icon } from '@tabler/icons-svelte'` (legado `SvelteComponentTyped`, **não** `Component` do svelte) — e nunca redeclarar `Icon` no mesmo escopo de um `let icon` (dá "Identifier 'Icon' has already been declared").
- **Tokens**: cor só por classe semântica vinda do `@theme static` de `packages/design-tokens/src/semantic.css` (`text-error`, `bg-error-soft`, `text-accent`, `bg-accent-soft`, `text-fg/muted`, `bg-surface/sunken/elevated/hover`, `border-line`) — nunca cor literal. `text-dimmed`/`text-highlighted` **não** existem no SvelteKit (vêm do Nuxt UI) — usar `text-muted`/`text-fg` (ver Fase 3).
- **Smoke de referência (5 cenários)**: rotas privadas sem cookie → `303 /login?next=%2F…`; com cookie → 200 com shell; `/login` logado → `303 /dashboard`; cookie inválido → `303 /login?next=%2Fdashboard`; 404 → status 404 + "Página não encontrada". Rodar com Chrome headless via CDP (`/tmp/opencode/cdp-smoke.js` + `cdp-interact.js`, `ws@8.21.3` já em `node_modules`); no SvelteKit o sign-out via curl exige `-H 'Origin: http://localhost:5173'` (senão 403 `MISSING_OR_NULL_ORIGIN`) e a sessão é revogada a cada sign-out (relogar entre execuções).

## Fase 2 (Nuxt e SvelteKit)

`/resumo` e `/busca` portados com paridade de textos/placeholders/toasts/zod.
Commits: Nuxt `3cca8b8` ("fase 2 resumo+busca"), SvelteKit `4def400`.

- **Nuxt**: `pages/resumo.vue` e `pages/busca.vue` (fina, só título + componente);
  componentes `CardDaySummary`, `CardDaySummaryContent`, `FormNlSearch`,
  `CardSearchResultList`, `SkeletonStack`, `EmptyState`. O resumo é
  **query** `useDaySummaryQuery()` (`services/insights/insights.query.ts`,
  `execute()` no clique do botão) e a busca é **mutation**
  `useNlSearchMutation()` (`services/assistant/`).
- **SvelteKit**: mesmos componentes inicialmente em `src/lib/components/`
  (singulative, sem `index.ts`) — **desde a Fase 4 movidos** para
  folder-per-component + `_components` por rota (ver
  [Fase 4](#fase-4-arquitetura-espelhada--motion)). Título em `<svelte:head>`
  (`Resumo do dia | ia-task-manager` /
  `Busca por IA | ia-task-manager`). A IA (busca/sugestão/resumo) é sempre
  **mutação** (`createMutation`); `FormNlSearch` é `<input>` + `onkeydown`
  (Enter) e botão `Buscar` `disabled` sem `canSearch`, disparando
  `useNlSearchMutation`; o resumo lê `listTodos` do SSR (`+page.server.ts` +
  `depends(todoQueryKeys.all)`).
- Resumo sem resumo gerado → `CardDaySummary` mostra `EmptyState`
  ("Gere um resumo para ver o plano de execução do dia.") — texto idêntico
  nos 3 apps.
- `useSeoMeta` (Nuxt) equivale ao `<svelte:head>` (SvelteKit).

## Fase 3 (Nuxt e SvelteKit)

`/tarefas` e `/settings` portados. Commits: Nuxt `7bc0f02`; SvelteKit `248175e`
(tarefas) e `0c1c955` (settings + `depends(authQueryKeys.me)` no layout).

**`/tarefas`**

- **Tabela**: Next usa `@tanstack/react-table` v9; Nuxt fica no **v8** (compat do
  `UTable`); SvelteKit usa **`@tanstack/svelte-table` v9.2.6** (a v8 é exclusiva
  do Svelte 4 — peer `svelte ^4`, importa de `svelte/internal`; a v9 exige
  `^5.0.0` e usa `createTable({ features, get data() {...} })` + `FlexRender` +
  `renderComponent(Comp, { ...on* })` — callbacks de componente viram props).
  Colunas: `todoColumnHelper.columns([...])`; headers ordenáveis em componente
  `TableSortHeader`. Ordenação, filtros e query string vivem em
  `lib/todo/{todo-filters,use-todo-filters}.ts` (Nuxt) / `lib/constants/` +
  `lib/todo/*` (SvelteKit); `priorityColors`/`priorityLabels` em
  `lib/constants/todo.constants.*`.
- **Modais** (`ModalTodoForm`, `ModalAiSuggest`): Nuxt `UModal`;
  SvelteKit `<dialog>` nativo + `onMount(showModal)` / `$effect` reativo ao
  `open`, com `onclick` no backdrop (`event.target === dialogEl`) e
  `oncancel` liberado quando "buscando sugestão". `--dialog-max-width`/`42rem`.
- **Form (SvelteKit)** (criar/editar): HTML semântico (`input`, `textarea`,
  `select` + classes `input`/`textarea`/`select`), validação `zod.safeParse` +
  `z.flattenError(...).fieldErrors` mostrada em `<span class="text-error text-xs">`.
  Mutações: `useCreateTodoMutation`/`useUpdateTodoMutation`/`useDeleteTodoMutation`
  (invalidam `todoQueryKeys.all`); toasts `notifyError('Erro ao criar')` etc.

**`/settings`**

- Abas verticais com ARIA completa (`tablist`/`tab`/`tabpanel`, `aria-selected`,
  roving `tabindex`, setas/Home/End):
  Nuxt `UTabs orientation="vertical" :unmount-on-hide="false"`; SvelteKit
  painéis montados e inativos ocultos com classe `hidden` (keepMounted). No
  Svelte: `{@const Icon = tab.icon}` com `bind:this` em array
  `$state<HTMLButtonElement[]>`.
- **Dados**: accounts/sessions vêm do SSR (useAsyncData no Nuxt, load
  function no SvelteKit) — sem query client. SvelteKit:
  `settings/+page.server.ts` com `fetchMyAccounts(fetch)` +
  `fetchMySessions(fetch)` em `Promise.all`, `depends(authQueryKeys.accounts)` +
  `depends(authQueryKeys.sessions)`, retorno `{ accounts, sessions, loadError }`;
  retry na page com `invalidate` por key. `+layout.server.ts` ganhou
  `depends(authQueryKeys.me)` para o `navShell` refletir `updateProfile`
  (`invalidate(authQueryKeys.me)` no sucesso).
- Nuxt: leitura via `useMyAccountsQuery()`/`useMySessionsQuery()` +
  `useMeQuery()` (Query data é `AuthUser | null`).
- **Token acessível** — o `text-dimmed`/`text-highlighted` do Nuxt vem do
  **Nuxt UI** (`--ui-text-dimmed`), NÃO de `design-tokens` (só define
  `--color-fg`/`--color-muted`). Next não usa essas classes. **No SvelteKit elas
  são no-op (não geram CSS) — usar `text-muted`/`text-fg`** (comprovado por
  `grep` no CSS buildado). Por isso os ports do SvelteKit usam `text-fg` nos
  títulos e `text-muted` nos secundários, e o `+page.svelte` de settings foi
  reescrito do placeholder que usava `text-highlighted`.
- **Skeleton presets usados**: `preset-tonal`, `preset-tonal-error`,
  `preset-tonal-success` (Verificado/Vinculada), `preset-tonal-warning`
  (Não verificado), `preset-tonal-primary` (aba ativa / Esta sessão) — todos
  em `adapter skeleton.css` + gerados sob demanda no build.
- **Bug de `''` corrigido (commit `d2b701a`, 3 apps)**: `createTodoSchema`/`updateTodoSchema` passaram a aceitar **`description: ''`/só-espaço → `null`** (trim + max 2000) e **`dueDate: ''` → `null`** (string-data/Date/null/undefined ok; string inválida continua erro `Invalid input`). Em zod v4: `z.preprocess` vaza `unknown` no `z.input` (quebra o RHF do Next) → usar `z.union([...])` + `.transform` e `z.coerce.date<string | Date>()`; campos com transform que recebem `undefined` exigem **`.optional()`** (senão viram obrigatórios). `descriptionSchema` original (min 1, do `todoSchema`/`todoSuggestionSchema`) ficou intacto. No BFF, `todo-draft.toTodoCreateRequest` normaliza com `toDateInput` (''→null) e `toDescriptionInput` (''→null) — cobre o draft da IA (`''` → undefined/omitido). Runtime validado por smokes `tsx`.

## Fase 4 (arquitetura espelhada + motion)

Commits: SvelteKit `b7b4599`, Nuxt `6c6711f`, motion `c81afe3` (ambos + `d2b701a`
dos bugs, Fase 1).

**Arquitetura de componentes = espelho do Next nos 2 apps:**

- **Globais** (usados em várias pages) ficam em `components/<nome>/<nome>.<ext>`
  em `src/lib/components/` (SvelteKit) e `app/components/` (Nuxt): `empty-state`,
  `error-state`, `skeleton-stack`, `theme-switcher`, `render-boundary` (+
  `render-query-boundary` novo), e no SvelteKit também `nav-shell` e `toaster`.
  O Nuxt **não tem** NavShell/Toaster (usa `layouts/private.vue` + `UApp` toasts).
- **Colação por rota** `_components/` dentro de cada page: tarefas (8, incluindo
  os `table-todo-*`), settings (6), resumo (`card-day-summary.vue` flat +
  `card-day-summary-content/`), busca (`form-nl-search.vue` flat +
  `card-search-result-list/`), auth (`(public)/_components/card-auth` +
  `oauth-buttons`; `login|register/_components/form-login|form-register`). A regra
  flat-vs-folder espelha o que o Next já faz (flat para o container forte,
  folder para os filhos).
- **Nuxt**: `nuxt.config.ts` ganhou `components: [{ path: '~/app/components',
pathPrefix: false }]` — sem isso o auto-import de `components/<x>/<x>.vue`
  viraria `Xxx<Xxx>`. Componentes movidos para `pages/**/_components/` deixam de
  ser auto-importados: quem usa precisa de **`import X from './<rota>/_components/...'`**
  e irmãos usam **caminho relativo** (`../table-sort-header/...`);
  globais continuam auto-import (sem `import`).
- **SvelteKit**: imports sempre explícitos (não há auto-import); ganhou
  `(private)/+error.svelte` (espelho do `error.tsx` do grupo Next) com
  `invalidateAll()` no retry e 404 via `goto(resolve(paths.HOME))`.
- FormLogin/FormRegister extraídos nos 2 apps (estado/handlers/schema + `OAuthButtons`
  - divisor + link; prop `callbackURL` default `paths.DASHBOARD`; página = `CardAuth`
  - form + `useSeoMeta`/`<svelte:head>`).
- `RenderBoundary`/`RenderQueryBoundary` (novos, paridade com o Next): props
  `status: 'pending'|'error'|'ready'`, slot/snippet `children` + `fallback` +
  `errorSnippet`, emit/event `retry`; fallback default = `SkeletonStack`, erro
  default = `ErrorState`.

**Motion (tw-animate-css v1.4 nos 2 apps):**

- `@import 'tw-animate-css';` logo após o `@import 'tailwindcss';` em
  `routes/layout.css` (SvelteKit) e `app/assets/css/main.css` (Nuxt).
- O `@theme static` de `packages/design-tokens/src/motion.css` gera utilities
  Tailwind 4 nativas: `--duration-*` → `duration-fast|base|slow` e `--ease-*` →
  `ease-standard|entrance|exit` (confirmado no CSS buildado; nunca usar
  `--duration-*`/`--ease-*` literais).
- Micro-entradas nos cartões de conteúdo (paridade nos 2 apps):
  `animate-in fade-in duration-base ease-entrance` (tabela de tarefas, resumo,
  sections de settings) e `animate-in fade-in slide-in-from-bottom-2 duration-base
ease-entrance` (resultado da busca); `CardAuth` com `duration-slow`.
- **Transição de rota**: SvelteKit = **View Transitions** via `onNavigate` no
  `+layout.svelte` raiz (`document.startViewTransition`, ignorado em
  `prefers-reduced-motion`) + `::view-transition-group/old/new(root)` com
  `--duration-slow`/`--ease-standard` no `layout.css`; Nuxt = `app.pageTransition`
  `{ name: 'page', mode: 'out-in' }` no `nuxt.config.ts` + classes
  `.page-enter-active/leave-active` em `main.css` (opacity+translateY, `--duration-slow`/
  `--ease-standard`). Ambos respeitam `prefers-reduced-motion: reduce` (animations
  off da camada nativa) e o `tw-animate-css` já desativa os próprios utilities.
- **Skeleton dialog**: `.animate-dialog` (usado em `modal-todo-form` e
  `modal-ai-suggest` do SvelteKit) usa `--anim-duration:.25s` fixo — o
  `layout.css` faz `dialog.animate-dialog { --anim-duration: var(--duration-slow) }`
  (não mexer no source do Skeleton). Nuxt `UModal` é nativa, sem override.

## Estrutura

```
app/                   → páginas (Server Components/Client por necessidade)
  <rota>/_components/  → componentes usados só naquela page (e seus subcomponents)
components/            → apenas componentes compartilhados entre várias pages (nav-shell)
providers/             → composition root: index.tsx só compõe (ReactQueryProvider > ThemeProvider > children)
  react-query/         → ReactQueryProvider (QueryClient via useState + ReactQueryDevtools) e seu barrel
  theme/               → ThemeProvider (MantineProvider + AppNotifications), mantine-theme.ts (createTheme) e seu barrel
services/              → vertical de dados do front por contexto: *.request.ts (operações cruas) + hooks query/mutation + query keys
services/graphql/      → cliente GraphQL da UI (graphql-request) + base request<T> + fragments
```

## Data layer (`services/`)

> **Escopo**: a camada `services/` existe nos **3 apps** (GraphQL + auth, com as decisões
> abaixo). As páginas privadas já estão portadas nos 3 apps (fases 1–3) — as convenções
> ficam em [Fase 1 privada (Nuxt e SvelteKit)](#fase-1-privada-nuxt-e-sveltekit),
> [Fase 2 (Nuxt e SvelteKit)](#fase-2-nuxt-e-sveltekit) e
> [Fase 3 (Nuxt e SvelteKit)](#fase-3-nuxt-e-sveltekit).

### Contrato comum aos 3 apps (decidido e implementado)

Contrato comum aos três (paridade com o Next, `services/<contexto>/` com
imports explícitos — sem auto-import):

- **Nuxt**: `useAsyncData`/`useFetch` **nativo** (sem @tanstack/vue-query),
  POST em `/api/graphql`. O `useFetch` troca `$fetch` por `useRequestFetch()`
  sozinho quando a URL é relativa (`fetch.js:108`), então o cookie de sessão
  chega no SSR sem header manual.
- **SvelteKit**: **load functions nativas** (sem @tanstack/svelte-query).
  `+page.server.ts` para leitura autenticada, `+page.ts` para client-only.
  O `client.ts` dos services **recebe o `fetch` do load como parâmetro** — é ele
  que herda cookie/authorization no SSR.
- **Invalidação é match EXATO nos dois frameworks** (Nuxt `asyncData.js:303`
  → `keys.includes(key)`; SvelteKit `client.js:2384` → `url.href === href`).
  Não há prefix-matching como no React Query, então a query-key factory precisa
  enumerar explicitamente o que toda escrita renova (ex.: `writeTargets:
['TODO:LIST']` → `refreshNuxtData(...)` / `invalidate(...)`).
- **Nunca** cachear `/api/graphql` na borda (`routeRules`/`defineCachedEventHandler`
  do Nitro, `cache-control` público no SvelteKit): é por-usuário e o
  `createContext` lê o cookie. O único cache válido é o Redis por `userId`
  (`packages/server/shared/cache`), que os 3 apps compartilham.
- `invalidateAll()` do SvelteKit só funciona no browser e re-roda tudo — evitar.

- Um arquivo por responsabilidade, por contexto:
  - `services/graphql/base.ts` → `GraphQLClient` singleton + `request<T>` (normaliza `ClientError` → `errors[0].message`)
  - `services/graphql/fragments.ts` → `TODO_FIELDS`, fragmento GraphQL compartilhado entre contextos
  - `services/todo/todo.request.ts` → operações GraphQL cruas (sem react-query): `listTodos`/`getTodo`/`createTodo`/`updateTodo`/`deleteTodo`/`suggestTodo` + `TodoCreateRequest`/`TodoUpdateRequest` + parse via `todoSchema`
  - `services/assistant/assistant.request.ts` → `nlSearch` (parse via `assistantSchema` → `Assistant`)
  - `services/insights/insights.request.ts` → `summarizeDay`
  - `services/auth/auth.client.ts` → `createAuthClient()` do better-auth — **só** signIn/signUp/signOut/social/linkSocial; nunca para ler sessão
  - `services/auth/auth.request.ts` → operações GraphQL de conta: `fetchMe` (nullable, aceita `headers` para o prefetch SSR), `myAccounts`, `mySessions`, `updateProfile`, `changeEmail`, `changePassword`, `unlinkAccount`, `revokeSession` (**por `sessionId`, nunca por token**), `revokeOtherSessions`
  - `services/todo/todo.keys.ts` → **query key factory** em UPPERCASE com underline (ex.: `todoQueryKeys.all = ['TODO_LIST']`, `todoQueryKeys.detail(id) = ['TODO_DETAIL', id]`); `as const` para manter o literal
  - `services/todo/todo.query.ts` → `useTodosQuery()` (queryKey + queryFn)
  - `services/todo/todo.mutation.ts` → `useCreateTodoMutation`/`useUpdateTodoMutation`/`useDeleteTodoMutation`/`useSuggestTodoMutation` (os `toTodo*Request` convertem `TodoDraft`/`TodoUpdateDraft` de `lib/todo/` para o contrato de `todo.types.ts` e `invalidateQueries(todoQueryKeys.all)` ficam aqui; suggestTodo pertence ao context todos, igual no server)
  - `services/assistant/assistant.mutation.ts` → `useNlSearchMutation`
  - `services/insights/insights.mutation.ts` → `useSummarizeDayMutation`
  - `services/auth/auth.query.ts` → `useMeQuery`/`useMyAccountsQuery`/`useMySessionsQuery`
  - `services/auth/auth.mutation.ts` → mutations de perfil/email/senha/contas/sessões; `updateProfile` usa `setQueryData(me)`, demais `invalidateQueries`
  - `services/auth/auth.keys.ts` → query keys do contexto auth (`authQueryKeys.me`, etc.)
- A camada `*.request.ts` importa apenas `services/graphql/*` e `lib/schemas/*`; hooks importam `*.request.ts` — dependência unidirecional
- Contrato de entrada de mutation fica em `services/<ctx>/<ctx>.types.ts`, **derivado do codegen** (`XMutationVariables['input']`), e request e mutation importam dali. A mutation nunca redeclara o shape inline, e o generic `useMutation<T, Error, V>` do React Query repete esse tipo — não inventa outro. Sufixo `Request`, não `Input`: `*Input` é o nome do input object gerado, que é o tipo do schema, não o parâmetro da mutation (`UpdateProfileInput` do codegen aceita `name: null` para limpar o campo; a versão escrita à mão recusava)
- `DraftInput` é exceção: é `z.input<typeof draftInputSchema)` em `packages/schemas`, a fonte de domínio que o Pothos nomeia `DraftInput` no schema — todos os três leem ela, ninguém redeclara
- `request(document, variables?, headers?)` virou **`request({ document, variables, headers })`**: o `undefined` na segunda posição era obrigatório só para alcançar a terceira, então não carregava informação. `RequestOptions` mora em `services/graphql/graphql.types.ts` junto do `RequestHeaders`/`GraphQLFetch`, que é onde vive qualquer contrato de `graphql/*` — `base.ts` é a superfície de runtime
- Hooks de IA ficam no contexto de negócio (assistant/insights/todos), **não** em uma pasta `ai` — `server/shared/ai` (infra do provider) fica imune
- Componentes **nunca** chamam `services/graphql/base` direto: usam os hooks de `services/*`
- Toasts/notificações vêm dos componentes como **callbacks por chamada** (`mutateAsync(vars, { onSuccess, onError })`) — o `onSuccess` do service é exclusivo da invalidação
- Sessão: o par `lib/auth/` — `session.ts` (SSR) → `getCurrentUser()` (lê cookies + `auth.api.getSession` com `new Headers({ cookie })`, React `cache()`) e `verifySession()` (redirect `/login` se não autenticado); `(private)/layout.tsx` chama `verifySession()` **e** prefetcha `me` num `HydrationBoundary` (mesmo padrão de `tarefas/page.tsx`); NavShell lê `useMeQuery()` e o logout faz `queryClient.clear()` antes do `signOut()`
- `lib/auth/use-session-guard.ts` → par **cliente** do `session.ts`, que só protege o SSR; assina o `QueryCache` e, em erro com `code === 'UNAUTHENTICATED'` **ou** `me` resolvendo `null`, faz `queryClient.clear()` + `router.replace('/login?next=…')` (guard de loop com `useRef`). É **hook, não componente**: não renderiza nada, e `(private)/layout.tsx` é Server Component — hook não roda lá. Fica hospedado no `NavShell` (único component client da árvore privada, e onde o logout manual já faz a mesma política) em vez de um `<SessionGuard />` devolvendo `null` dentro de `_components/`, que é pasta de JSX. Escopo privado porque o `NavShell` só é usado no `(private)/layout.tsx`: `useMeQuery` só é lido em tela autenticada — global cobriria além do escopo real
- OAuth: login e vínculo de conta (Google/GitHub) usam o client do better-auth — `authClient.signIn.social` / `authClient.linkSocial({ provider, callbackURL })`; o redirect para o consent é gerenciado pelo client (redirectPlugin → `window.location.href` interno), sem `window.location` manual nem GraphQL no fluxo

## Tooling e gates

- **ESLint 9.39.5**, flat config, quatro escopos: a raiz (`eslint.config.mjs`, que cuida de si e de `packages/*` e ignora `apps/**`), `apps/nextjs`, `apps/nuxt` e `apps/sveltekit`, cada um com a sua config no app. No ESLint 9 a config é descoberta pelo cwd, e é por isso que o app roda o seu `eslint` em vez de a raiz passar arquivo: `pnpm lint` = `eslint` na raiz + `turbo run lint`
- **Não subir para o ESLint 10 agora.** O `eslint-config-next@16.3.7` ainda depende de `eslint-plugin-react@7.37.5`, cujo peer chega a `^9.7`, e o plugin quebra com `contextOrFilename.getFilename is not a function` em `react/display-name` (tickets `eslint-plugin-react#3977` e `#3979`, `eslint-plugin-import#3227`). O fork que corrigiria isso não está publicado no registry, então `pnpm.overrides` não é caminho
- `@nuxt/eslint-config` fica em `~1.16.0` pela mesma razão: a `1.17.0` exige `eslint-plugin-unicorn@73`, que pede ESLint `>=10.4`
- Só o app Next tem `@tanstack/eslint-plugin-query` (`flat/recommended`); a `exhaustive-deps` roda **ligada**, com o `requestHeaders` na `allowlist` da própria regra. O prefetch de Server Component usa o cookie de propósito fora da chave, e a chave precisa casar com a query do cliente para o `HydrationBoundary` funcionar. A exceção é por **nome de variável**, então uma dependência de verdade faltando continua sendo acusada
- **Prettier é único, na raiz**, com `prettier-plugin-svelte` só em `overrides` de `*.svelte` — carregado no topo, ele faz o Prettier varrer diretórios com ponto e formatar arquivos que não são do projeto
- **Gates**: `pnpm gate` = `pnpm lint && pnpm format:check`, e é o `pre-push` que o chama. O `pre-commit` é o lint-staged, que já traz o `pnpm typecheck` junto, então o gate cobre só o que o lint por arquivo não vê: drift de prettier ou de regra/config, que só aparece depois de subir ferramenta ou mexer em config. Não há suíte de testes no monorepo
- **Commit**: conventional commits via commitlint; o `pre-commit` é o lint-staged, que chama o eslint de dentro de cada app com `pnpm --filter <pacote> exec eslint --fix` e o prettier da raiz num comando só

## Playground do GraphQL (os 3 fronts montam o Yoga in-process)

Os três apps sobem o **mesmo** Yoga de `@ia-task-manager/bff` — nenhum chamada o
BFF pela rede, nenhum servidor de playground separado. `createGraphQLHandler()` é
um fetch handler `(Request) => Response`, `graphqlEndpoint` é `/api/graphql` nos
três, e o `GET` serve o GraphiQL (o Yoga o habilita fora de produção). Smoke test
de que o schema Pothos montou: `POST { todos { id } }` sem sessão devolve
`UNAUTHENTICATED` (o `builder.ts` marca `queryType` com o scope `loggedIn`).

| App    | Monta em                     | Serve em                            | Adaptador do Yoga                                                                                                  |
| ------ | ---------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Next   | `services/graphql/server.ts` | `app/api/graphql/route.ts`          | `createServerGraphQLClient()` (`inProcessFetch`), registrado em `instrumentation.ts`                               |
| Nuxt   | `server/utils/graphql.ts`    | `server/api/graphql.ts`             | `defineEventHandler` + `toWebRequest`/`sendWebResponse` (NÃO `fromWebHandler`: o 2º param dele é o `NodeResponse`) |
| Svelte | `src/lib/server/graphql.ts`  | `src/routes/api/graphql/+server.ts` | `RequestHandler` que desempacota `event.request`; exporta `GET`/`POST` (equivalente ao `toNextJsHandler`)          |

Pegadinhas de bundler (cada front já resolveu a sua):

- **Nuxt/Nitro**: o treeshake do rollup do Nitro descarta import de efeito
  (`import './modules'`), então o schema saía vazio. Resolvido com
  `nitro.rollupConfig.treeshake.moduleSideEffects` devolvendo `true` para
  `@ia-task-manager/bff`. `sideEffects: true` no package.json do BFF **não**
  basta — o Nitro sobrescreve essa config. Os packages source-only precisam de
  `build.transpile`; o `better-sqlite3`/Prisma ficam em `nitro.externals.external`.
- **SvelteKit/Vite**: `ssr.noExternal` + `optimizeDeps.exclude` para os 3
  packages; `server.fs.allow: ['..', '../..']` porque o pnpm não escreve
  `workspaces` e o Vite não acha a raiz do monorepo sozinho.
- **Vite não carrega `.env` no `process.env`** (só o Nitro faz, e só com prefixo
  `VITE_` no client). O `vite.config.ts` faz `Object.assign(process.env,
loadEnv('development', import.meta.dirname, ''))`, senão o
  `environment.ts` (que valida com zod e lança) estoura no SSR.
- **`adapter-auto` não é runtime Node**: `vite dev` funciona, mas para build de
  produção precisa do `@sveltejs/adapter-node`.
- O HTML do GraphiQL vem de `unpkg.com` — o endpoint responde sem internet, a
  UI não.
- `DATABASE_URL` e `BETTER_AUTH_URL` são **por app**: o primeiro é relativo ao
  cwd de cada app, e o segundo tem que ser a porta do app que está rodando
  (`environment.ts` só usa `3000` como fallback). Cookie ignora porta, então com
  o mesmo `BETTER_AUTH_SECRET` e o mesmo SQLite a sessão é compartilhada entre os
  três em dev.

**Extensões do VS Code**: uma lista só, em `.vscode/extensions.json` na raiz
(ESLint, Prettier, Tailwind, Volar, Svelte, Prisma, pnpm) — não há mais
`.vscode` por app.

## Convenções frontend

- Tipar sempre com TypeScript explícito; sem `any` sem justificativa
- Hooks de service terminam com o sufixo do tipo: `Query` (leitura) ou `Mutation` (escrita), ex.: `useTodosQuery`, `useNlSearchMutation`
- Hook que **não** é de service mora em `lib/<area>/use-*.ts` com `'use client'`, do lado da lógica pura que ele embrulha (`lib/todo/todo-filters.ts` + `use-todo-filters.ts`, `lib/auth/session.ts` + `use-session-guard.ts`); sem sufixo `Query`/`Mutation`, que é regra só de service. Hook que não renderiza nada não vira component — `_components/` é de JSX
- Component usado em só uma page → `app/<rota>/_components/`; subcomponents seguem a mesma lógica
- `components/` na raiz é exclusivo para componentes usados em múltiplas pages
- Nome de componente começa pelo tipo UI (Card, Form, Table, Modal, Button…) + nome (ex.: `FormNlSearch`, `CardDaySummary`, `TableTodoManager`, `ModalTodoForm`)
- Validação de input reutiliza schemas zod compartilhados com o server
- Schemas zod **pontuais** (usados só pelo componente/form) são criados co-locados no próprio componente; `lib/schemas/{context}` tem **apenas o espelhamento do contrato BFF/server** (ex.: `changePasswordSchema` espelha o contrato da mutação GraphQL — por isso mora em `lib`, não no componente)
- Padrão de Card do Mantine: `shadow="sm" padding="lg" withBorder` (aplicado em todos os `<Card>` do app)
- A UI fala com o server por **dois canais**: dados autenticados via **GraphQL** (`services/graphql/base.ts`, sempre através dos hooks de `services/*`); fluxos de sessão (login/registro/logout/redirecionamentos OAuth) via **REST do Better Auth** (`services/auth/auth.client.ts`)
- Erros de operação chegam normalizados pela `services/graphql/base.ts` como **`GraphQLRequestError`** (`message` + `code` de `extensions.code`, que o Yoga só emite para `AppError`); `UNAUTHENTICATED` é o gatilho do `use-session-guard`
- Ícones: `@tabler/icons-react` NÃO tem `IconBrandEmail` — usar `IconMail`
- Em Server Components, **não** use `component={<C>}` de client (ex.: `<Button component={Link}>`): o componente client não serializa funções vindas de RSC → envolva com `<Link href><Button/></Link>` (erro "Functions cannot be passed directly to Client Components")
- Estilo de código segue prettier (single quote, sem semicolon)
- Server Components por padrão; "use client" só onde há interatividade/estado

## Paradigma loading / erro

Autoridade do assunto: skill `async-ui-patterns` (`frontend-engineer/`). Não
duplicar aqui — carregá-la antes de implementar ou revisar qualquer estado
assíncrono.

Fatos de arquivo (o resto do padrão está no skill):

- Rotas privadas têm `app/(private)/loading.tsx` e `app/(private)/error.tsx`;
  públicas não têm loading/error (são estáticas). No Next 16 as props de
  `error.tsx` são `{ error, retry, reset }` — o retry usa **`retry()`**.
- Leitura de dados usa `useSuspenseQuery` em `services/*/query.ts`; `data`
  nunca é `undefined`, pode ser `null` (`useMeQuery` → `AuthUser | null`).
  `data: X ?? []` e `isLoading` não existem nos consumidores.
- Quatro componentes globais em `components/<nome>/<nome>.tsx`:
  `loading-state`, `error-state`, `render-boundary`, `render-query-boundary`.
  Contrato: componente que chama `useSuspenseQuery` fica DENTRO do boundary.
- Páginas privadas que leem dados no load fazem prefetch + `HydrationBoundary`
  no Server Component (sem isso o suspense roda no SSR sem cookie →
  `UNAUTHENTICATED`). Consumidores de `useMeQuery()` também precisam de
  `RenderQueryBoundary` quando o dado pode faltar (early return **antes** de
  outros hooks → extrair subcomponente, senão `rules-of-hooks`).
- Sem ternários/lógica/variáveis no meio do JSX (regra do skill `react-patterns`): derivar fora, extrair subcomponentes com early return.
