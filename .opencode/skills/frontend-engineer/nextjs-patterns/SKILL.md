---
name: nextjs-patterns
description: Use when working with Next.js, App Router, Server Components, Client Components, data fetching, routing, middleware, metadata, or any Next.js specific patterns. Trigger on keywords like "next", "app router", "server component", "layout", "page.tsx", "route.ts", "middleware", "generateStaticParams", "generateMetadata". Estados de loading/erro de dados NÃO são escopo deste skill — ver "async-ui-patterns".
---

# Next.js Patterns

Referência de padrões do App Router para este projeto. Para estados
assíncronos de dados (loading, erro, empty, prefetch/hidratação), ver o skill
`async-ui-patterns` — que é a autoridade do assunto.

## App Router Structure

```
app/
├── layout.tsx           # Root layout (obrigatório)
├── page.tsx             # Home page
├── loading.tsx          # Global loading UI
├── error.tsx            # Global error boundary
├── not-found.tsx        # Global 404
├── (routes)/
│   ├── layout.tsx       # Layout do grupo de rotas
│   └── page.tsx
├── api/
│   └── route.ts         # API routes
└── [...slug]/
    └── page.tsx         # Catch-all routes
```

## Estrutura de componentes (convenção do projeto)

Componentes de uma rota vivem em `app/<rota>/_components/`, cada um na **própria pasta homônima**:

```
app/tarefas/
├── page.tsx                                # Server Component (shell estático)
└── _components/
    ├── table-todo-manager/
    │   └── table-todo-manager.tsx          # Client island principal da rota
    ├── modal-todo-form/
    │   └── modal-todo-form.tsx
    └── modal-ai-suggest/
        └── modal-ai-suggest.tsx
```

- Página (`page.tsx`) fica **Server Component** (síncrona quando não há `await` de dados) e renderiza header/metadados estáticos; a interatividade vira **client island** no `_components/`.
- Cada componente na sua pasta `<nome>/<nome>.tsx` (ex: `_components/card-search-result-list/card-search-result-list.tsx`).
- `components/` (raiz) é **apenas** para componentes multi-página (ex: `components/nav-shell/`). Componente específico de página (ex: `EmptyState`) é duplicado por página no `_components/` — **não** vai para a raiz.

## Camada `lib/` (contratos vs helpers de front)

- `lib/schemas/*`, `lib/graphql/*` — contrato de domínio compartilhado, usado por front, server e bff (importadas por server/bff) **sem** dependência de UI.
- `lib/utils/*`, `lib/constants/*` — **frontend-only**: `lib/utils/notifications.ts` (toasts `notifyError`/`notifySuccess`/`toErrorMessage`, dependem de `@mantine/notifications`); `lib/utils/date.ts` (`formatDate`, `toDateInputValue`, `defaultDateOptions`); `lib/constants/todo.constants.ts` (tokens de UI `priorityLabels/Colors/Options`); `lib/constants/router-paths.ts`.
- ❌ Server/bff nunca importam `lib/utils/*` nem `lib/constants/*` — vazaria Mantine para o server.
- Utils de data/toast são **centralizadas** em `lib/utils/*`, nunca duplicadas no componente (`formatDate` expõe `Intl.DateTimeFormatOptions` como 2º argumento).

## Server Components (padrão)

```tsx
// page.tsx é Server Component por padrão
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // ISR: revalida a cada hora
  })
  const json = await data.json()

  return <div>{json.title}</div>
}
```

## Client Components

```tsx
'use client'

import { useState, useEffect } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}
```

**Regra**: usar `"use client"` apenas quando precisar de interatividade (eventos, state, effects). Manter Server Components sempre que possível.

## Data Fetching

```tsx
// Server Component - fetch direto
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
})

// Server Action para mutações
;('use server')
export async function createItem(formData: FormData) {
  const raw = Object.fromEntries(formData)
  await db.item.create({ data: raw })
  revalidatePath('/items')
}
```

## Route Handlers (API)

```tsx
// app/api/items/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const items = await db.item.findMany()
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.item.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}
```

## Metadata

```tsx
// Layout ou Page
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'Description',
  openGraph: {
    title: 'My App',
    images: ['/og.png'],
  },
}

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getItem(params.id)
  return { title: item.name }
}
```

## Middleware

```tsx
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

## Dynamic Routes

```tsx
// app/items/[id]/page.tsx
interface Props {
  params: { id: string }
}

export default async function ItemPage({ params }: Props) {
  const item = await getItem(params.id)
  // ...
}

// generateStaticParams para SSG
export async function generateStaticParams() {
  const items = await getItems()
  return items.map((item) => ({ id: item.id }))
}
```

## Loading e Error States

`loading.tsx` e `error.tsx` são arquivos de rota do App Router, mas no
projeto eles são apenas a **primeira das 3 camadas** de UI assíncrona, e o
comportamento (skeleton, `role`, mensagens, botão de retry, boundary de query)
é definido pelo skill `async-ui-patterns` — não repetir aqui.

Fato de versão que importa: no **Next 16** as props de `error.tsx` são
`{ error, retry, reset }`. O botão de retry deve chamar **`retry()`** (re-executa
o fetch); `reset()` apenas re-renderiza a árvore de suspense **sem** refazer a
requisição. Usar `reset()` como handler do retry é bug silencioso — a UI
"tenta de novo" e nada acontece.

Ver `async-ui-patterns` → "Arquitetura — 3 camadas".

## Tips

- Prefira Server Components — menos JavaScript no client
- Use `loading.tsx` para UX de carregamento instantâneo (convenção completa em `async-ui-patterns`)
- Mantenha `"use client"` o mais alto possível na árvore
- Use Server Actions para formulários (não precisa de API route)
- `revalidatePath` e `revalidateTag` para invalidação de cache
