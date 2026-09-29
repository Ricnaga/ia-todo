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
> **Daqui para baixo, este documento descreve o app Next** (`apps/nextjs/`), o mais maduro: `app/`, `components/`, `lib/`, `providers/`, `services/`. Os apps Nuxt e SvelteKit ainda são scaffolds. O núcleo e a API ficam em `packages/server` e `packages/bff`; os contratos zod em `packages/schemas`.
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
- **State**: nenhum state manager global — **server state é react-query**, UI state local é `useState`/`useForm`. Não instalar zustand/redux sem necessidade concreta. `zustand`, `@mantine/dates` e `@mantine/hooks` seguem declarados no `package.json` por decisão do usuário, mas têm **0 imports** (auditoria de 2026-09) — não usar como se fossem APIs disponíveis em código novo. `@tanstack/react-query-devtools` deixou a lista: é importado pelo `providers/react-query`
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

> **Pausado por decisão do usuário**: a evolução da auth e das tarefas fica para depois que a arquitetura do BFF estiver definida. Quando voltar, começar por aqui.

- Um arquivo por responsabilidade, por contexto:
  - `services/graphql/base.ts` → `GraphQLClient` singleton + `request<T>` (normaliza `ClientError` → `errors[0].message`)
  - `services/graphql/fragments.ts` → `TODO_FIELDS`, fragmento GraphQL compartilhado entre contextos
  - `services/todo/todo.request.ts` → operações GraphQL cruas (sem react-query): `listTodos`/`getTodo`/`createTodo`/`updateTodo`/`deleteTodo`/`suggestTodo` + `TodoCreateRequest`/`TodoUpdateRequest` + parse via `todoSchema`
  - `services/assistant/assistant.request.ts` → `nlSearch` (parse via `assistantSchema` → `Assistant`)
  - `services/insights/insights.request.ts` → `summarizeDay`
  - `services/auth/auth.client.ts` → `createAuthClient()` do better-auth — **só** signIn/signUp/signOut/social/linkSocial; nunca para ler sessão
  - `services/auth/auth.request.ts` → operações GraphQL de conta: `fetchMe` (nullable, aceita `requestHeaders` para o prefetch SSR), `myAccounts`, `mySessions`, `updateProfile`, `changeEmail`, `changePassword`, `unlinkAccount`, `revokeSession` (**por `sessionId`, nunca por token**), `revokeOtherSessions`
  - `services/todo/todo.keys.ts` → **query key factory** em UPPERCASE com underline (ex.: `todoQueryKeys.all = ['TODO_LIST']`, `todoQueryKeys.detail(id) = ['TODO_DETAIL', id]`); `as const` para manter o literal
  - `services/todo/todo.query.ts` → `useTodosQuery()` (queryKey + queryFn)
  - `services/todo/todo.mutation.ts` → `useCreateTodoMutation`/`useUpdateTodoMutation`/`useDeleteTodoMutation`/`useSuggestTodoMutation` (casts `unknown → TodoCreateRequest/TodoUpdateRequest` e `invalidateQueries(todoQueryKeys.all)` ficam aqui; suggestTodo pertence ao context todos, igual no server)
  - `services/assistant/assistant.mutation.ts` → `useNlSearchMutation`
  - `services/insights/insights.mutation.ts` → `useSummarizeDayMutation`
  - `services/auth/auth.query.ts` → `useMeQuery`/`useMyAccountsQuery`/`useMySessionsQuery`
  - `services/auth/auth.mutation.ts` → mutations de perfil/email/senha/contas/sessões; `updateProfile` usa `setQueryData(me)`, demais `invalidateQueries`
  - `services/auth/auth.keys.ts` → query keys do contexto auth (`authQueryKeys.me`, etc.)
- A camada `*.request.ts` importa apenas `services/graphql/*` e `lib/schemas/*`; hooks importam `*.request.ts` — dependência unidirecional
- Hooks de IA ficam no contexto de negócio (assistant/insights/todos), **não** em uma pasta `ai` — `server/shared/ai` (infra do provider) fica imune
- Componentes **nunca** chamam `services/graphql/base` direto: usam os hooks de `services/*`
- Toasts/notificações vêm dos componentes como **callbacks por chamada** (`mutateAsync(vars, { onSuccess, onError })`) — o `onSuccess` do service é exclusivo da invalidação
- Sessão SSR: `lib/auth/session.ts` → `getCurrentUser()` (lê cookies + `auth.api.getSession` com `new Headers({ cookie })`, React `cache()`) e `verifySession()` (redirect `/login` se não autenticado); `(private)/layout.tsx` chama `verifySession()` **e** prefetcha `me` num `HydrationBoundary` (mesmo padrão de `tarefas/page.tsx`); NavShell lê `useMeQuery()` e o logout faz `queryClient.clear()` antes do `signOut()`
- `app/(private)/_components/session-guard/session-guard.tsx` → monta no `(private)/layout.tsx`, junto do `verifySession()`; assina o `QueryCache` e, em erro com `code === 'UNAUTHENTICATED'` **ou** `me` resolvendo `null`, faz `queryClient.clear()` + `router.replace('/login?next=…')` (guard de loop com `useRef`). Mora no route group privado porque `useMeQuery` só é lido em tela autenticada — global cobriria além do escopo real
- OAuth: login e vínculo de conta (Google/GitHub) usam o client do better-auth — `authClient.signIn.social` / `authClient.linkSocial({ provider, callbackURL })`; o redirect para o consent é gerenciado pelo client (redirectPlugin → `window.location.href` interno), sem `window.location` manual nem GraphQL no fluxo

## Tooling e gates

- **ESLint 9.39.5**, flat config, quatro escopos: a raiz (`eslint.config.mjs`, que cuida de si e de `packages/*` e ignora `apps/**`), `apps/nextjs`, `apps/nuxt` e `apps/sveltekit`, cada um com a sua config no app. No ESLint 9 a config é descoberta pelo cwd, e é por isso que o app roda o seu `eslint` em vez de a raiz passar arquivo: `pnpm lint` = `eslint` na raiz + `turbo run lint`
- **Não subir para o ESLint 10 agora.** O `eslint-config-next@16.3.7` ainda depende de `eslint-plugin-react@7.37.5`, cujo peer chega a `^9.7`, e o plugin quebra com `contextOrFilename.getFilename is not a function` em `react/display-name` (tickets `eslint-plugin-react#3977` e `#3979`, `eslint-plugin-import#3227`). O fork que corrigiria isso não está publicado no registry, então `pnpm.overrides` não é caminho
- `@nuxt/eslint-config` fica em `~1.16.0` pela mesma razão: a `1.17.0` exige `eslint-plugin-unicorn@73`, que pede ESLint `>=10.4`
- Só o app Next tem `@tanstack/eslint-plugin-query` (`flat/recommended`); a `exhaustive-deps` está desligada porque o prefetch de Server Component usa o cookie de propósito fora da chave, e a chave precisa casar com a query do cliente para o `HydrationBoundary` funcionar
- **Prettier é único, na raiz**, com `prettier-plugin-svelte` só em `overrides` de `*.svelte` — carregado no topo, ele faz o Prettier varrer diretórios com ponto e formatar arquivos que não são do projeto
- **Gates**: `pnpm lint`, `pnpm format:check` e `pnpm typecheck`; `gate.json` é a lista de tarefas e o `pre-push` percorre todas. Não há suíte de testes no monorepo
- **Commit**: conventional commits via commitlint; o `pre-commit` é o lint-staged, que chama o eslint de dentro de cada app com `pnpm --filter <pacote> exec eslint --fix` e o prettier da raiz num comando só

## Convenções frontend

- Tipar sempre com TypeScript explícito; sem `any` sem justificativa
- Hooks de service terminam com o sufixo do tipo: `Query` (leitura) ou `Mutation` (escrita), ex.: `useTodosQuery`, `useNlSearchMutation`
- Component usado em só uma page → `app/<rota>/_components/`; subcomponents seguem a mesma lógica
- `components/` na raiz é exclusivo para componentes usados em múltiplas pages
- Nome de componente começa pelo tipo UI (Card, Form, Table, Modal, Button…) + nome (ex.: `FormNlSearch`, `CardDaySummary`, `TableTodoManager`, `ModalTodoForm`)
- Validação de input reutiliza schemas zod compartilhados com o server
- Schemas zod **pontuais** (usados só pelo componente/form) são criados co-locados no próprio componente; `lib/schemas/{context}` tem **apenas o espelhamento do contrato BFF/server** (ex.: `changePasswordSchema` espelha o contrato da mutação GraphQL — por isso mora em `lib`, não no componente)
- Padrão de Card do Mantine: `shadow="sm" padding="lg" withBorder` (aplicado em todos os `<Card>` do app)
- A UI fala com o server por **dois canais**: dados autenticados via **GraphQL** (`services/graphql/base.ts`, sempre através dos hooks de `services/*`); fluxos de sessão (login/registro/logout/redirecionamentos OAuth) via **REST do Better Auth** (`services/auth/auth.client.ts`)
- Erros de operação chegam normalizados pela `services/graphql/base.ts` como **`GraphQLRequestError`** (`message` + `code` de `extensions.code`, que o Yoga só emite para `AppError`); `UNAUTHENTICATED` é o gatilho do `session-guard`
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
