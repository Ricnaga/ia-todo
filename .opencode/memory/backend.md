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
- **IA**: @google/generative-ai (Gemini), acessado via `server/shared/ai` (port `AiService` + `GeminiAiService` — provider encapsulado; os use-cases injetam só a abstração)
- **Validação**: zod (schemas compartilhados com o frontend)

## Arquitetura — núcleo único, porta GraphQL, DDD por bounded contexts

```
lib/
├── shared/          → contratos usados por frontend e server (Tipos e constantes de UI)
│   ├── todos/       → todo.ui.ts (constantes de UI: priorityLabels/Colors/Options)
│   └── assistant/   → SearchResult
├── schemas/         → zod compartilhado entre fronteiras (todo.ts, assistant.ts, insights.ts) — published language
│   todos/todo.ts    → todoSchema é a BASE canônica (type Todo); create/update/draft/suggestion derivam dela via pick/extend
└── graphql/         → cliente GraphQL da UI (graphql-request) + operações tipadas
                      → NÃO confundir com o diretório gerado lib/generated ⛔ (removido — Prisma sai em server/db/generated)

server/              → núcleo de negócio (zero dependência de Next), DDD por bounded contexts
├── modules/
│   ├── todos/       → context CORE: Todo aggregate + CRUD + suggestTodo (shaping de todo com IA)
│   │                → clean architecture: controllers/ (orquestram use-cases), use-cases/ (por operação),
│   │                → repositories/ (port), infra/ (impl Prisma), errors.ts
│   ├── assistant/   → context SUPPORTING: nlSearch (busca em linguagem natural). Recebe Todo[] via parâmetro
│   │                → caixa-preta, consumidora do aggregate de todos (Customer-Supplier), sem port próprio
│   └── insights/    → context SUPPORTING: summarizeDay (resumo do dia). Recebe Todo[] via parâmetro
│   │                → filtra '!completed' DENTRO do use-case (regra de negócio no domínio, não no resolver)
├── shared/
│   ├── ai/          → INFRA genérica: ai.service.interface.ts (port AiService), gemini-ai.service.ts (GeminiAiService),
│   │                → gemini-schema.mapper.ts (converte zod → Schema Gemini; caso sem suporte → throws)
│   └── container.ts → composition root: DI manual (sem inversify), resolve todos controladores
├── config/          → environment.ts (env com parse zod, UPPERCASE)
├── db/              → prisma.ts (singleton) + generated/ (Prisma Client gerado)
└── utils/           → helpers genéricos

bff/                 → camada de apresentação de API (GraphQL) — NÚCLEO HEXAGONAL, espelha os bounded contexts
├── adapters/        → ports + adapters por context (a fronteira que o resolver consome)
│   ├── todo/        → todo.port.ts (interface TodoPort: CRUD + suggestTodo, SEM import de server/) + todo.adapter.ts
│   ├── assistant/   → assistant.port.ts (AssistantPort: nlSearch) + assistant.adapter.ts
│   └── insights/    → insights.port.ts (InsightsPort: summarizeDay) + insights.adapter.ts
│   fluxo: resolver → ctx.adapters.todo (Port) → adapter → controller (server)
├── context.ts       → GraphQLContext { adapters: { todo, assistant, insights } } — ÚNICO ponto que importa de server/ (composition root do BFF)
├── graphql.ts       → createGraphQLHandler() — Yoga montado com schema + context
└── graphql/         → GraphQL (builder, types, resolvers/, errors, schema); reusa server/modules
    ├── builder.ts   → SchemaBuilder (Context + Scalars/enums) + Query/Mutation raiz
    ├── types.ts     → representações do BFF (objectRefs/inputs por domínio)
    ├── errors.ts    → raiseResolvable + execute: mapeia DomainError/ZodError → GraphQLError (yoga mascara o resto)
    ├── resolvers/   → resolvers por context: todos.ts (CRUD + suggestTodo), assistant.ts (nlSearch), insights.ts (summarizeDay)
    │                → NÃO importam server; pegam via ctx.adapters (3º argumento do resolver) + executam via errors.execute
    │                → orquestração todo→assistant/insights fica no resolver (busca bruta + delegação MECÂNICA, sem regra)
    └── schema.ts    → importa resolvers (side-effect) e exporta builder.toSchema()

app/api/graphql/route.ts → único endpoint: sobe o handler via createGraphQLHandler() (transporte fino)
```

Regras da divisão:

- **Frontend (Client Components) importa só de `lib/shared`, `lib/schemas` e `lib/graphql`** — nunca de `server/` nem `bff/`. `lib/shared` guarda `SearchResult` e constantes de UI (`priorityLabels/Colors/Options`); `Todo` e os inputs (`CreateTodoInput`/`UpdateTodoInput`) vêm de `lib/schemas/todo.ts`; `lib/graphql/client.ts` é a única ponte de dados da UI para o server.
- `server/` não depende de Next (`next/server`), nem de `app/api`; só de `lib/shared`, `lib/schemas` e de si mesmo. Testável sem mockar Next.
- `bff/graphql` importa de `bff/adapters` + `lib/` (camada de montagem de schema/resolvers). O server entra no BFF apenas pelo composition root em `bff/context.ts` (via `server/shared/container.ts`), nunca por import direto nos resolvers/adpaters — limpo de server exceto nos adapters (que tipam os controllers).
- `app/api/graphql/route.ts` é o único endpoint (não há mais REST).
- Passo do Prisma: gerar client para `server/db/generated/prisma` (schema.prisma → output).

## Convenções backend

- Tipar sempre com TypeScript explícito; sem `any` sem justificativa
- DDD: bounded contexts por domínio (`todos` core, `assistant`/`insights` supporting) espelhados no BFF; assistant/insights são consumidores do aggregate `Todo` (recebem `Todo[]` via parâmetro, sem port próprio) — regra de negócio nunca vaza para o resolver (ex.: `summarizeDay` filtra `!completed` dentro do use-case)
- IA é infra genérica (`server/shared/ai`): use-cases dependem do port `AiService`, nunca do SDK Gemini; troca de provider = novo adapter, sem tocar nos contexts
- Camada de negócio (`server/modules`) isolada de HTTP/GraphQL (ports & adapters); `server/` nunca importa de `app/api` nem de `next/server`
- Frontend importa só `lib/shared`, `lib/schemas` e `lib/graphql` (contratos e cliente); nunca `server/`/`bff/`
- Validação de input com zod em todas as fronteiras
- Erros tratados de forma consistente: a UI Normaliza `errors[0].message` no wrapper (`lib/graphql/client.ts`); o bff mapeia `DomainError`/`ZodError` → `GraphQLError` (`bff/graphql/errors.ts`); nunca expor stack trace em produção
- Estilo de código segue prettier (single quote, sem semicolon)
