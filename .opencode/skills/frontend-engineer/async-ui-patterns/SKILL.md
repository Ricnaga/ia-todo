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
3. **Componentes de UI genéricos** (`components/`): `LoadingState` (skeleton,
   `role="status"`/`aria-busy`) e `ErrorState` (`role="alert"`, título default
   "Erro ao carregar", botão "Tentar novamente").

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
await queryClient.prefetchQuery({
  queryKey: authQueryKeys.accounts,
  queryFn: () => fetchMyAccounts({ cookie: cookieStore.toString() }),
  staleTime: 5_000, // casado com o default do client (providers/index.tsx)
})
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
- Fetchers de leitura aceitam `requestHeaders?` opcional
  (`fetchMyAccounts`/`fetchMySessions`/`listTodos`).
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
