---
alwaysApply: true
---

# Memória de contexto — Frontend

> Contexto do projeto `ia-task-manager` para o opencode, lado de UI/frontend. Ver também [`backend.md`](./backend.md).

## O que é o app

**ia-task-manager**: gerenciador de tarefas com assistência de IA. A IA não é um chat — é uma feature que estrutura, organiza e interpreta dados de tarefa.

Features de IA na UI (via Gemini, structured output validado por zod no server):

1. `suggestTodo` — rascunho solto vira tarefa estruturada (em `/tarefas`)
2. `summarizeDay` — resumo + sugestão de foco do dia (em `/resumo`)
3. `nlSearch` — busca em linguagem natural interpretada em critérios tipados (em `/busca`)

## Stack frontend

- **Next.js 16** (App Router) + React 19 + TypeScript strict
- **UI**: Mantine (core, dates, form, hooks, notifications) + Tabler Icons + Tailwind 4
- **Data fetching**: @tanstack/react-query consumindo **GraphQL** (`/api/graphql`) via wrapper tipado em `lib/graphql/client.ts`; + @tanstack/react-table
- **State**: zustand (client-side)
- **Formulários/validação**: react-hook-form + zod (@hookform/resolvers)

## Páginas

- `/` — landing
- `/tarefas` — CRUD + suggestTodo (`_components/table-todo-manager` + `modal-todo-form` + `modal-ai-suggest`)
- `/resumo` — summarizeDay (`_components/card-day-summary`)
- `/busca` — nlSearch (`_components/form-nl-search`)

## Estrutura

```
app/                   → páginas (Server Components/Client por necessidade)
  <rota>/_components/  → componentes usados só naquela page (e seus subcomponents)
components/            → apenas componentes compartilhados entre várias pages (nav-shell)
providers/             → provedores globais (QueryClient, Mantine)
services/              → hooks de dados por contexto (todo, ai): query/mutation + query keys
lib/graphql/           → cliente GraphQL da UI (graphql-request) + operações tipadas
```

## Data layer (`services/`)

- Um arquivo por responsabilidade, por contexto:
  - `services/todo/todo.keys.ts` → **query key factory** em UPPERCASE com underline (ex.: `todoQueryKeys.all = ['TODO_LIST']`, `todoQueryKeys.detail(id) = ['TODO_DETAIL', id]`); `as const` para manter o literal
  - `services/todo/todo.query.ts` → `useTodosQuery()` (queryKey + queryFn)
  - `services/todo/todo.mutation.ts` → `useCreateTodoMutation`/`useUpdateTodoMutation`/`useDeleteTodoMutation`/`useSuggestTodoMutation` (casts `unknown → TodoCreateRequest/TodoUpdateRequest` e `invalidateQueries(todoQueryKeys.all)` ficam aqui; suggestTodo pertence ao context todos, igual no server)
  - `services/assistant/assistant.mutation.ts` → `useNlSearchMutation`
  - `services/insights/insights.mutation.ts` → `useSummarizeDayMutation`
- Hooks de IA ficam no contexto de negócio (assistant/insights/todos), **não** em uma pasta `ai` — `server/shared/ai` (infra do provider) fica imune
- Componentes **nunca** chamam `lib/graphql/client` direto: usam os hooks de `services/*`
- Toasts/notificações vêm dos componentes como **callbacks por chamada** (`mutateAsync(vars, { onSuccess, onError })`) — o `onSuccess` do service é exclusivo da invalidação

## Convenções frontend

- Tipar sempre com TypeScript explícito; sem `any` sem justificativa
- Hooks de service terminam com o sufixo do tipo: `Query` (leitura) ou `Mutation` (escrita), ex.: `useTodosQuery`, `useNlSearchMutation`
- Component usado em só uma page → `app/<rota>/_components/`; subcomponents seguem a mesma lógica
- `components/` na raiz é exclusivo para componentes usados em múltiplas pages
- Nome de componente começa pelo tipo UI (Card, Form, Table, Modal, Button…) + nome (ex.: `FormNlSearch`, `CardDaySummary`, `TableTodoManager`, `ModalTodoForm`)
- Validação de input reutiliza schemas zod compartilhados com o server
- A UI fala com o server **só via GraphQL** (`lib/graphql/client.ts`), sempre através dos hooks de `services/*`; não existe mais REST
- Erros de operação chegam normalizados pela `lib/graphql/client.ts` (usa `errors[0].message` do envelope do Yoga)
- Estilo de código segue prettier (single quote, sem semicolon)
- Server Components por padrão; "use client" só onde há interatividade/estado
