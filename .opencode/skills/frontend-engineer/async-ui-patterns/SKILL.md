---
name: async-ui-patterns
description: Use when building OR reviewing loading/error/empty states for async data in the frontend — suspense queries, Next.js route loading.tsx/error.tsx, skeletons, error boundaries, retry, server prefetch + HydrationBoundary, and mutation-busy UIs. Trigger on keywords like "suspense", "useSuspenseQuery", "useQuery", "loading", "skeleton", "error boundary", "retry", "RenderBoundary", "RenderQueryBoundary", "LoadingState", "ErrorState", "HydrationBoundary", "prefetch", "isLoading", "isPending", "loading.tsx", "error.tsx", "fallback", "revalidate".
metadata:
  audience: frontend-engineer, staff-engineer
  scope: react, nextjs, tanstack-query
---

# Padrões de UI assíncrona (loading / erro / empty)

Paradigma único do app para estados assíncronos. Visa: SSR limpo (sem fetch
sem cookie), transições sem skeleton piscando e erro recuperável com retry.

Este skill é a **autoridade** do assunto. As regras de Next.js que servem de
porta de entrada estão em `nextjs-patterns`, mas o comportamento de loading /
erro / empty / prefetch só é definido aqui — não replicar em memory nem em
outro skill.

## Arquitetura — 3 camadas (nesta ordem)

1. **Arquivos de rota do Next** (camada primária para o que a rota resolve):
   - `app/(private)/loading.tsx` — skeleton de rota (`LoadingState`); páginas
     públicas **não** têm loading/error (estáticas).
   - `app/(private)/error.tsx` — `'use client'`; **Next 16**: props
     `{ error, retry, reset }` — o botão "Tentar novamente" deve chamar
     **`retry()`** (re-executa o fetch); `reset` só re-renderiza sem refetch.
2. **Boundaries React** para o que os arquivos de rota não resolvem (suspense
   que acontece em client island / dentro de um layout): usar
   `RenderQueryBoundary` (para hooks de query) ou `RenderBoundary` (suspense
   sem query). **Regra: todo componente que chama `useSuspenseQuery` fica
   DENTRO do boundary.**
   - `RenderBoundary` = `ErrorBoundary` (react-error-boundary) + `Suspense`,
     usando `fallbackRender` (tem acesso a `error` e `resetErrorBoundary`).
   - `RenderQueryBoundary` = `QueryErrorResetBoundary` + `RenderBoundary` com
     `onReset={reset}` — assim reset + retry recarrega a suspense query **sem**
     `refetch()`.
   - `react-error-boundary` é dependência válida: 3+ usos e é o padrão do
     TanStack para error boundaries.
3. **Componentes de UI genéricos** (`components/`): `LoadingState` (skeleton,
   reusa `SkeletonStack`, `role="status"`/`aria-busy`) e `ErrorState`
   (`IconAlertCircle`, `role="alert"`, título default "Erro ao carregar",
   botão "Tentar novamente").

## Regras para queries

- **Todas as leituras usam `useSuspenseQuery`** — não existe `useQuery` com
  `isLoading`/`data ?? []` nos hooks nem nos consumidores. `data` nunca é
  `undefined` (mas pode ser `null`, ex. `useMeQuery` → `AuthUser | null`).
- `useSuspenseQuery` força `enabled: true` (não dá para desabilitar por query)
  e dispensa `suspense: true` no QueryClient (default).
- **Suspense dispara fetch no SSR** → toda page privada que lê dados no load
  precisa de **server prefetch + hydration** (ver fluxo abaixo). Sem isso,
  o hook roda no servidor sem cookie: requests `UNAUTHENTICATED` e ruído de
  erro. Páginas que só usam **mutations** NÃO precisam (mutation não roda no
  SSR) — `isPending`/`isError` de mutations no JSX é legítimo (loading de
  botão, resultado da busca).

## Prefetch + hidratação no servidor

A page (Server Component) que lê dados deve:

```tsx
const queryClient = new QueryClient()
await queryClient
  .query({
    queryKey: authQueryKeys.accounts,
    queryFn: () => fetchMyAccounts({ cookie: cookieStore.toString() }),
    staleTime: 5_000, // casado com o default do client (providers/index.tsx)
  })
  .catch(() => undefined) // best-effort: semântica do prefetchQuery, deprecado no TanStack v5

// ...
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    {/* client island que chama useMyAccountsQuery */}
  </HydrationBoundary>
)
```

Pontos de atenção:

- **Fetch por canal**: `services/graphql/base.ts` resolve URL absoluta
  (`window.location.origin` no client; `BETTER_AUTH_URL` no servidor) — URL
  relativa quebra o `fetch` do Node no SSR (`ERR_INVALID_URL`).
- `request<T>(doc, vars?, headers?)` aceita headers; fetchers de leitura
  (`fetchMyAccounts`/`fetchMySessions`/`listTodos`) expõem `requestHeaders?`
  opcional, usado no prefetch SSR.
- **Sempre embrulhar o fetcher em closure zero-arg**:
  `queryFn: () => fetchMyAccounts(headers)` — passar `fetchMyAccounts` direto
  liga o primeiro parâmetro ao `QueryFunctionContext` do TanStack.
- O estado desidratado fica no payload Flight do HTML (as chaves `AUTH_ACCOUNTS`
  etc. aparecem no HTML de produção); no client, o `HydrationBoundary` importa
  esses dados no QueryClient singleton → a seção renderiza sem skeleton
  (útil para validar via curl que a hidratação aconteceu).

## Empty state e busy de mutation

- Empty state: componente local da page (`_components/`), renderizado quando a
  coleção está vazia (os dados já são `[]` do query/schema no trim).
- Busy por linha em tabela: **`mutation.isPending && mutation.variables?.id === row.id`**
  (nunca só `variables`, que persiste depois de concluir).

## Debug / validação

- SSR limpo = dev log **sem** `ERR_INVALID_URL` nem `UNAUTHENTICATED`.
- HTML de produção: página que lê dados NO load não pode conter só o skeleton
  da rota sem payload desidratado (conferir chaves do queryKey no HTML).
- Erros sempre logados (`console.error`); `error.message` visível **só em dev**
  (Next não sanitiza erros de Client Components). Mensagem amigável default.
- Validação final: `pnpm typecheck`, `pnpm lint`, `pnpm build`, smoke nas
  rotas privadas com cookie autenticado.

## Referências cruzadas

- `nextjs-patterns` — porta de entrada do App Router; `loading.tsx`/`error.tsx`
  são a camada 1 deste skill.
- `react-patterns` §4.8 — mutações (`mutate` vs `mutateAsync`, fechar modal só
  em `onSuccess`); a regra de "sem lógica/ternário no meio do JSX" vale aqui.
- `frontend-patterns` — `role="status"`/`role="alert"`, foco visível, targets
  de toque do botão "Tentar novamente".
- `staff-engineer/code-review-checklist` — avaliar este skill em code review.
