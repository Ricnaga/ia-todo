---
alwaysApply: true
---

# Memória de contexto — Frontend

> Contexto do projeto `ia-task-manager` para o opencode, lado de UI/frontend. Ver também [`backend.md`](./backend.md).
>
> **Monorepo pnpm + Turborepo**: o app Next está em `apps/nextjs/` (`@ia-task-manager/nextjs`) e contém `app/`, `components/`, `lib/`, `providers/`, `services/`. O núcleo e a API saíram para `packages/server` e `packages/bff`; os contratos zod para `packages/schemas`.
>
> O app consome os packages por nome (`@ia-task-manager/schemas`, `@ia-task-manager/bff`, `@ia-task-manager/server`) via `transpilePackages` — eles publicam TS puro, sem build. O alias `@/*` do Next é exclusive do app. Lint e format rodam uma única vez na raiz (ESLint com config única); `pnpm typecheck`/`build` passam pelo Turborepo.

## O que é o app

**ia-task-manager**: gerenciador de tarefas com assistência de IA. A IA não é um chat — é uma feature que estrutura, organiza e interpreta dados de tarefa.

Features de IA na UI (via Gemini, structured output validado por zod no server):

1. `suggestTodo` — rascunho solto vira tarefa estruturada (em `/tarefas`)
2. `summarizeDay` — resumo + sugestão de foco do dia (em `/resumo`)
3. `nlSearch` — busca em linguagem natural interpretada em critérios tipados (em `/busca`)

## Stack frontend

- **Next.js 16** (App Router) + React 19 + TypeScript strict
- **UI**: Mantine (core, dates, form, hooks, notifications) + Tabler Icons + Tailwind 4
- **Auth**: better-auth client (`services/auth/auth.client.ts` via `createAuthClient`); cookies/sessão via REST do Better Auth (`app/api/auth/[...all]`)
- **Data fetching**: @tanstack/react-query consumindo **GraphQL** (`/api/graphql`) via wrapper tipado em `services/graphql/base.ts`; + @tanstack/react-table
- **State**: zustand (client-side)
- **Formulários/validação**: `@mantine/form` com `schemaResolver` (Standard Schema, embutido no Mantine v9) + schemas zod v4 compartilhados em `lib/schemas` (ex.: `changePasswordSchema`); sem react-hook-form

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
providers/             → provedores globais (QueryClient, Mantine)
services/              → vertical de dados do front por contexto: *.request.ts (operações cruas) + hooks query/mutation + query keys
services/graphql/      → cliente GraphQL da UI (graphql-request) + base request<T> + fragments
```

## Data layer (`services/`)

- Um arquivo por responsabilidade, por contexto:
  - `services/graphql/base.ts` → `GraphQLClient` singleton + `request<T>` (normaliza `ClientError` → `errors[0].message`)
  - `services/graphql/fragments.ts` → `TODO_FIELDS`, fragmento GraphQL compartilhado entre contextos
  - `services/todo/todo.request.ts` → operações GraphQL cruas (sem react-query): `listTodos`/`getTodo`/`createTodo`/`updateTodo`/`deleteTodo`/`suggestTodo` + `TodoCreateRequest`/`TodoUpdateRequest` + parse via `todoSchema`
  - `services/assistant/assistant.request.ts` → `nlSearch` (parse via `assistantSchema` → `Assistant`)
  - `services/insights/insights.request.ts` → `summarizeDay`
  - `services/auth/auth.client.ts` → `createAuthClient()` do better-auth (signUp/signIn/signOut/social via REST)
  - `services/auth/auth.request.ts` → operações GraphQL de conta: `fetchMe` (nullable), `myAccounts`, `mySessions`, `updateProfile`, `changeEmail`, `changePassword`, `unlinkAccount`, `revokeSession`, `revokeOtherSessions`
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
- Sessão SSR: `lib/auth/session.ts` → `getCurrentUser()` (lê cookies + `auth.api.getSession` com `new Headers({ cookie })`, React `cache()`) e `verifySession()` (redirect `/login?next=...` se não autenticado); `(private)/layout.tsx` chama `verifySession()`; NavShell usa `authClient.useSession()` no client + logout
- OAuth: login e vínculo de conta (Google/GitHub) usam o client do better-auth — `authClient.signIn.social` / `authClient.linkSocial({ provider, callbackURL })`; o redirect para o consent é gerenciado pelo client (redirectPlugin → `window.location.href` interno), sem `window.location` manual nem GraphQL no fluxo

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
- Erros de operação chegam normalizados pela `services/graphql/base.ts` (usa `errors[0].message` do envelope do Yoga; GraphQL expõe só message + extensions.code)
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
  `UNAUTHENTICATED`).
- Sem ternários/lógica/variáveis no meio do JSX (regra do skill `react-patterns`): derivar fora, extrair subcomponentes com early return.
