# ia-task-manager

Gerenciador de tarefas com assistência de IA. A IA não é um chat — é uma feature que estrutura, organiza e interpreta dados de tarefa.

## O que o app faz

Gestão completa de tarefas (CRUD): criar, editar, deletar e concluir; campos de título, descrição, prioridade (low/medium/high/urgent), data de vencimento e subtarefas; listagem em tabela com ações rápidas.

IA aplicada ao ciclo de vida da tarefa — 3 features:

1. **suggestTodo** — um rascunho solto ("falar c/ RH terça") vira tarefa estruturada (título, descrição, prioridade, subtarefas) via botão "Sugerir com IA".
2. **summarizeDay** — tarefas pendentes viram um resumo do dia + sugestão de foco gerados por IA.
3. **nlSearch** — busca em linguagem natural ("minhas tarefas urgentes de hoje") interpretada em critérios tipados e aplicada na lista.

## Páginas

| Rota       | Página                             |
| ---------- | ---------------------------------- |
| `/`        | Landing/README do app + navegação  |
| `/tarefas` | CRUD de tarefas + botão sugerir IA |
| `/resumo`  | summarizeDay (IA)                  |
| `/busca`   | nlSearch (IA)                      |

## Arquitetura — monorepo pnpm, núcleo único, porta GraphQL, DDD por bounded contexts

```
apps/nextjs/      → app Next.js (único front por enquanto)
├── app/           → App Router: (private)/, (public)/, api/
│   ├── api/graphql/route.ts   → GET/POST delega a createGraphQLHandler() do @ia-task-manager/bff
│   └── api/auth/[...all]/route.ts → handler do better-auth
├── components/    → componentes UI compartilhados
├── lib/           → auth/ (session) + constants/ (UI tokens, router paths) + utils/
└── services/      → cliente GraphQL da UI (graphql-request) + operações tipadas

packages/
├── tsconfig/      → base de TypeScript compartilhada (source-only, sem build)
├── schemas/       → zod compartilhado entre as fronteiras (published language), 1 pasta por contexto com barrel
│   ├── todo/        → todo.model.ts (canônico: Todo, TodoSuggestion, subtasks) + todo.io.ts (IO da fronteira: z.input/z.output)
│   ├── assistant/   → assistant.model.ts (models: Criteria, Assistant)
│   ├── auth/        → auth.model.ts (AuthUser/AuthSession) + auth.io.ts (IO)
│   └── insights/    → insights.model.ts (models: DaySummary)
├── server/        → núcleo de negócio (zero dependência de Next), DDD por bounded contexts
│   ├── modules/
│   │   ├── todos/     → context CORE: Todo aggregate + CRUD + suggestTodo (shaping de todo com IA)
│   │   │               → clean architecture: controllers + use-cases/ + repositories/ (port) + infra/ (Prisma)
│   │   ├── assistant/ → context SUPPORTING: nlSearch (caixa-preta, recebe Todo[] via parâmetro)
│   │   ├── auth/      → better-auth (infra) + resolveSession
│   │   └── insights/  → context SUPPORTING: summarizeDay (caixa-preta; filtra pendentes no use-case)
│   ├── shared/
│   │   ├── ai/        → INFRA genérica IA: ai.service.interface.ts (port) + gemini-ai.service.ts + zod→Gemini mapper
│   │   ├── cache/     → cache.interface.ts (port) + redis/
│   │   ├── container/ → composition root (DI manual, sem inversify)
│   │   └── oauth/     → port + service
│   ├── config/environment.ts → variáveis de ambiente com parse zod (UPPERCASE)
│   ├── db/          → prisma.ts (singleton better-sqlite3) + generated/ (Prisma Client gerado)
│   └── prisma/      → schema.prisma + migrations + dev.db (SQLite)
└── bff/            → camada de apresentação de API (núcleo hexagonal, espelha os bounded contexts)
    ├── adapters/    → ports (contrato do BFF, sem import de server) + adapters por context
    │   ├── todo/      → todo.port.ts (CRUD + suggestTodo) + todo.adapter.ts
    │   ├── assistant/ → assistant.port.ts (nlSearch) + assistant.adapter.ts
    │   └── insights/  → insights.port.ts (summarizeDay) + insights.adapter.ts
    ├── context.ts   → GraphQLContext { adapters: { todo, assistant, insights } } — único ponto que importa de server/ (composition root do BFF)
    ├── graphql.ts   → createGraphQLHandler() — monta e retorna o Yoga (schema + context)
    └── pothos/      → camada GraphQL/Pothos por bounded context (consome as ports via ctx.adapters)
        ├── builder.ts   → SchemaBuilder (tipagem Context + Scalars) + Query/Mutation raiz (SÓ ISSO)
        ├── errors.ts    → raiseResolvable + execute: mapeia DomainError/ZodError → GraphQLError
        ├── scalars/     → scalars globais ({name}.ts + barrel): datetime.ts (DateTimeScalar)
        ├── modules/     → 1 pasta por bounded context, espelhando server/modules
        │   ├── todo/      → CORE: {context}.enums/ref/inputs/queries/mutations + barrel (CRUD + suggestTodo)
        │   ├── assistant/ → SUPPORTING: enums/ref/mutations (nlSearch)
        │   └── insights/  → SUPPORTING: ref/mutations (summarizeDay)
        │                 → acessam as ports via ctx.adapters (3º argumento do resolver) + executam via errors.execute
        │                 → orquestração todo→assistant/insights é mecânica (busca bruta + delegação, sem regra de negócio)
        └── schema.ts    → importa scalars + modules (side-effect) e exporta o schema
```

- **Source-only**: os packages publicam TypeScript puro (`main` → `src/index.ts`), sem etapa de build. O app os compila via `transpilePackages` no `next.config.ts`. Por isso os imports internos dos packages são **relativos** — o alias `@/*` do app não existe fora dele.
- A UI consome **GraphQL** via React Query, com operações tipadas no wrapper `services/graphql/base.ts`.
- Consumidores externos usam o mesmo endpoint GraphQL — uma porta, zero duplicação.
- Hexagonal no BFF + clean architecture/DDD no back: o BFF define as ports (`adapters/`, uma por bounded context); o server entra como adapter no único composition root (`bff/context.ts`), sem connectors/domain/factories intermediários — retomados só se surgir divergência real de shape (relay, multi-consumidores, subscriptions, 3º domínio).
- A IA é infra genérica em `packages/server/src/shared/ai`: os use-cases injetam o port `AiService`; trocar de provider (Gemini → outro) = novo adapter, sem tocar nos contexts.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Prisma 7 (SQLite via better-sqlite3) · GraphQL Yoga + Pothos · Google Gemini · Mantine · React Query · react-hook-form + zod · TanStack Table

## Começando

Pré-requisitos: Node.js 20+ e pnpm.

```bash
cp apps/nextjs/.env.example apps/nextjs/.env   # preencha GEMINI_API_KEY
printf 'DATABASE_URL="file:./prisma/dev.db"\n' > packages/server/.env
pnpm install
pnpm db:migrate
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

GraphQL (GraphiQL): [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) — endpoint único (UI + clientes externos); o GraphiQL abre no browser.

## Variáveis de ambiente

| Variável         | Obrigatória | Descrição                        |
| ---------------- | ----------- | -------------------------------- |
| `DATABASE_URL`   | sim         | URL do SQLite (ver abaixo)       |
| `GEMINI_API_KEY` | não (IA)    | Chave do Google AI Studio        |
| `GEMINI_MODEL`   | não         | Modelo padrão `gemini-2.5-flash` |

`GEMINI_API_KEY` é opcional: o app roda com CRUD; os recursos de IA precisam da chave.

O `DATABASE_URL` é relativo ao **cwd** de cada processo, então o mesmo arquivo aparece com caminhos diferentes:

| Onde          | Valor                                      | cwd               |
| ------------- | ------------------------------------------ | ----------------- |
| runtime (app) | `file:../../packages/server/prisma/dev.db` | `apps/nextjs`     |
| Prisma CLI    | `file:./prisma/dev.db`                     | `packages/server` |

Ambos resolvem para `packages/server/prisma/dev.db`.

## Scripts

| Comando             | Descrição                            |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | servidor de desenvolvimento          |
| `pnpm build`        | build de produção                    |
| `pnpm start`        | roda o build                         |
| `pnpm lint`         | ESLint (app + packages)              |
| `pnpm lint:fix`     | ESLint com correção automática       |
| `pnpm typecheck`    | TypeScript em todos os workspaces    |
| `pnpm format`       | formata com Prettier                 |
| `pnpm format:check` | verificação Prettier                 |
| `pnpm db:generate`  | gera o Prisma Client                 |
| `pnpm db:migrate`   | aplica/cria migrations               |
| `pnpm db:studio`    | Prisma Studio (browser do banco)     |
| `pnpm commit`       | commit com commitizen (convencional) |
