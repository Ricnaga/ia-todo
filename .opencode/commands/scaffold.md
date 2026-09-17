---
description: Gera scaffold de uma página/feature completa no Next.js.
agent: frontend-engineer
---

Gere a estrutura completa de uma feature ou página no projeto.

## Argumentos

`$ARGUMENTS` deve conter o caminho da feature (ex: `dashboard/settings`, `auth/login`).

## Passos

1. Analisar a estrutura existente do projeto (App Router, pastas, convenções)
2. Criar a estrutura da feature

### Estrutura padrão (App Router)

Para `app/(feature)/slug/`:

```
app/(feature)/slug/
├── page.tsx              # Página principal (Server Component)
├── layout.tsx            # Layout da feature (se necessário)
├── loading.tsx           # Loading state
├── error.tsx             # Error boundary
├── not-found.tsx         # 404 da feature
├── components/
│   └── FeatureComponent.tsx
├── actions.ts            # Server Actions (se aplicável)
├── types.ts              # Types da feature
└── utils.ts              # Helpers específicos
```

### Padrão da página

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feature Name',
  description: 'Descrição da feature',
}

export default async function FeaturePage() {
  // data fetching no servidor
  return <div>{/* conteúdo */}</div>
}
```

### Padrão do Server Action

```tsx
'use server'

import { z } from 'zod'

const schema = z.object({
  // campos validados
})

export async function actionName(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }
  // lógica
  return { success: true }
}
```

## Notas

- Adaptar conforme convenções existentes no projeto
- Incluir testes se houver testes no projeto
- Considerar se a feature precisa de API routes ou Server Actions
- Usar types existentes do projeto quando possível

## Convenções deste projeto

- **Gerenciador de pacotes**: `pnpm` (nunca npm/yarn)
- **UI**: Mantine (`@mantine/core`, `@mantine/form`, `@mantine/hooks`, `@mantine/notifications`) + Tabler Icons (`@tabler/icons-react`) + Tailwind
- **Dados no servidor**: GraphQL via `graphql-yoga` + `@pothos/core`; queries consumidas no client com `@tanstack/react-query` e `@tanstack/react-table`
- **State**: `zustand`
- **Validação**: `zod` + `react-hook-form` (`@hookform/resolvers`)
- **Banco**: Prisma (`prisma/schema.prisma`, SQLite via better-sqlite3), cliente em `server/db/prisma.ts`, casos de uso em `server/modules/*/use-cases/`, DI pelo composition root em `server/shared/container.ts`
- **Estilo de código**: single quotes, sem semicolon, trailing comma all (prettier)
- Verificar como arquivos similares existentes resolvem (ex: `components/`, `lib/schemas/`, `bff/pothos/`, `server/modules/`) antes de criar novo padrão
