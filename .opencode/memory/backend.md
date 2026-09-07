---
alwaysApply: true
---

# Memória de contexto — Backend

> Contexto do projeto `ia-task-manager` para o opencode, lado de dados/server. Ver também [`frontend.md`](./frontend.md).

## O que é o app

**ia-task-manager**: gerenciador de tarefas com assistência de IA. A IA não é um chat — é uma feature que estrutura, organiza e interpreta dados de tarefa.

3 features de IA (via Gemini, structured output validado por zod):

1. `suggestTodo` — rascunho solto vira tarefa estruturada
2. `summarizeDay` — resumo + sugestão de foco do dia
3. `nlSearch` — busca em linguagem natural interpretada em critérios tipados

## Stack backend

- **Banco**: Prisma 7 (SQLite via better-sqlite3), schema em `prisma/schema.prisma`, cliente em `server/db/prisma.ts`
- **API**: GraphQL (graphql-yoga + @pothos/core)
- **IA**: @google/generative-ai (Gemini), accionada via transporte independente de provider
- **Validação**: zod (schemas compartilhados com o frontend)

## Arquitetura — núcleo único, porta GraphQL

```
lib/
├── shared/          → contratos usados por frontend e server (Tipos e constantes de UI)
│   ├── todos/       → Todo, TodoCreate/Update, priorityLabels/Colors/Options
│   └── ai/          → SearchResult
├── schemas/         → zod compartilhado entre fronteiras (todo.ts, ai.ts)
└── graphql/         → cliente GraphQL da UI (graphql-request) + operações tipadas
                      → NÃO confundir com o diretório gerado lib/generated ⛔ (removido — Prisma sai em server/db/generated)

server/              → núcleo de negócio (zero dependência de Next)
├── modules/
│   ├── todos/       → clean architecture: controllers/ (orquestram use-cases), use-cases/ (por operação),
│   │                → repositories/ (port), infra/ (impl Prisma), errors.ts
│   └── ai/          → controllers/ + capabilities/ (suggest-todo, summarize-day, nl-search) + client.ts
├── shared/container.ts → composition root: DI manual (sem inversify), resolve todos controladores
├── config/          → environment.ts (env com parse zod, UPPERCASE)
├── db/              → prisma.ts (singleton) + generated/ (Prisma Client gerado)
└── utils/           → helpers genéricos

bff/                 → camada de apresentação de API (GraphQL)
├── context.ts       → GraphQLContext: controllers entregues aos resolvers (todos + ai) via container + createContext()
├── graphql.ts       → createGraphQLHandler() — Yoga montado com schema + context
└── graphql/         → GraphQL (builder, types, resolvers/, errors, schema); reusa server/modules
    ├── builder.ts   → SchemaBuilder (Context + Scalars/enums) + Query/Mutation raiz
    ├── types.ts     → representações do BFF (objectRefs/inputs por domínio)
    ├── errors.ts    → raiseResolvable + execute: mapeia DomainError/ZodError → GraphQLError (yoga mascara o resto)
    ├── resolvers/   → resolvers por feature: todos.ts (CRUD), ai.ts (suggestTodo/summarizeDay/nlSearch)
    │                → NÃO importam controllers; pegam via ctx (3º argumento do resolver) + executam via errors.execute
    └── schema.ts    → importa resolvers (side-effect) e exporta builder.toSchema()

app/api/graphql/route.ts → único endpoint: sobe o handler via createGraphQLHandler() (transporte fino)
```

Regras da divisão:

- **Frontend (Client Components) importa só de `lib/shared`, `lib/schemas` e `lib/graphql`** — nunca de `server/` nem `bff/`. `lib/shared` guarda tipos (`Todo`, `SearchResult`) e constantes de UI (`priorityLabels/Colors/Options`); `lib/graphql/client.ts` é a única ponte de dados da UI para o server.
- `server/` não depende de Next (`next/server`), nem de `app/api`; só de `lib/shared`, `lib/schemas` e de si mesmo. Testável sem mockar Next.
- `bff/graphql` importa de `server/` + `lib/` (camada de montagem de schema/resolvers). Controllers entram nos resolvers via `context` (DI resolvido pelo composition root em `server/shared/container.ts`), nunca por import direto — como `bff/context.ts`
- `app/api/graphql/route.ts` é o único endpoint (não há mais REST).
- Passo do Prisma: gerar client para `server/db/generated/prisma` (schema.prisma → output).

## Convenções backend

- Tipar sempre com TypeScript explícito; sem `any` sem justificativa
- Camada de negócio (`server/modules`) isolada de HTTP/GraphQL (ports & adapters); `server/` nunca importa de `app/api` nem de `next/server`
- Frontend importa só `lib/shared`, `lib/schemas` e `lib/graphql` (contratos e cliente); nunca `server/`/`bff/`
- Validação de input com zod em todas as fronteiras
- Erros tratados de forma consistente: a UI Normaliza `errors[0].message` no wrapper (`lib/graphql/client.ts`); o bff mapeia `DomainError`/`ZodError` → `GraphQLError` (`bff/graphql/errors.ts`); nunca expor stack trace em produção
- Estilo de código segue prettier (single quote, sem semicolon)
