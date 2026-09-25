---
alwaysApply: true
---

# Memória de contexto — Backend

> Contexto do projeto `ia-task-manager` para o opencode, lado de dados/server. Ver também [`frontend.md`](./frontend.md).
>
> **Monorepo pnpm**: o app Next está em `apps/nextjs/` (`@ia-task-manager/nextjs`). Todo o código abaixo (`server/`, `bff/`, `prisma/`, `lib/schemas`) vive sob `apps/nextjs/`. Fase 2: extrair `packages/schemas`, `packages/server`, `packages/bff`.

## O que é o app

**ia-task-manager**: gerenciador de tarefas com assistência de IA. A IA não é um chat — é uma feature que estrutura, organiza e interpreta dados de tarefa.

3 features de IA (via Gemini, structured output validado por zod):

1. `suggestTodo` — rascunho solto vira tarefa estruturada
2. `summarizeDay` — resumo + sugestão de foco do dia
3. `nlSearch` — busca em linguagem natural interpretada em critérios tipados

## Stack backend

- **Banco**: Prisma 7 (SQLite via better-sqlite3), schema em `prisma/schema.prisma`, cliente em `server/db/prisma.ts`. Modelos do Better Auth (`User`, `Session`, `Account`, `Verification`) + `Todo.userId` (FK + index)
- **Auth**: better-auth 1.7.5 (`server/modules/auth/infra/better-auth.ts`), email/password + Google/GitHub (condicionais a credenciais no `.env`) + account linking; `user.changeEmail.enabled` + `updateEmailWithoutVerification` (dev); verificação de email só loga URL no console
- **API**: GraphQL (graphql-yoga + @pothos/core) + REST do Better Auth (`app/api/auth/[...all]/route.ts`, só fluxos de sessão/cookies)
- **Cache**: Redis (cache-aside por `userId`), fallback silencioso se Redis indisponível — `server/shared/cache/` + `docker-compose.yml` (redis:7-alpine)
- **IA**: @google/generative-ai (Gemini), acessado via `server/shared/ai` (port `AiService` na raiz + adapters por provider em `ai/<provider>/`; os use-cases injetam só a abstração)
- **Validação**: zod (schemas compartilhados com o frontend)

## Arquitetura — núcleo único, porta GraphQL, DDD por bounded contexts

```
lib/
├── constants/       → constantes FRONTEND-only (tokens de UI: `todo.constants.ts` priorityLabels/Colors/Options; `router-paths.ts`) — server/bff não importam daqui
├── schemas/         → zod compartilhado entre fronteiras — published language, 1 pasta por contexto com barrel index.ts (path público `@/lib/schemas/{context}`)
│   todos/todo.model.ts → canônico (models): todoSchema é a BASE (type Todo); todoSuggestionSchema (type TodoSuggestion); subtaskSchema; prioritySchema
│   todos/todo.io.ts → IO da fronteira: createTodoSchema/updateTodoSchema/draftInputSchema + tipos z.input/z.output (ex.: CreateTodoInput=z.input, CreateTodoOutput=z.infer). z.input tolera null vindo do GraphQL; update trata null como "não alterar"/"limpar" por campo
│   assistant/assistant.model.ts → models (criteriaSchema, assistantSchema: Criteria, Assistant)
│   insights/insights.model.ts → models (daySummarySchema: DaySummary)
│   auth/auth.model.ts, auth/auth.io.ts → models de user/conta/sessão + schemas de input (updateProfile, changeEmail, changePassword, unlinkAccount, revokeSession)

server/              → núcleo de negócio (zero dependência de Next), DDD por bounded contexts
├── modules/
│   ├── todos/       → context CORE: Todo aggregate + CRUD + suggestTodo (shaping de todo com IA)
│   │                → clean architecture: controllers/ (orquestram use-cases), use-cases/ (por operação),
│   │                → repositories/ (port), infra/ (impl Prisma + CachedTodoRepository)
│   │                → TODAS as operações são scoped por userId (ITodoRepository.list/getById/create/update/delete recebem userId)
│   ├── auth/        → context SUPPORTING: use-cases/auth.use-case.interface.ts (port `IAuthUseCase`: resolveSession/getProfile/
│   │                → updateProfile/changeEmail/changePassword/listAccounts/unlinkAccount/listSessions/revokeSession/
│   │                → revokeOtherSessions/getProviders) + use-cases/auth.use-case.ts (AuthUseCase implements IAuthUseCase,
│   │                → DI auth + oauthService)
│   │                → vínculo de conta (OAuth) NÃO passa pelo GraphQL: o client chama `authClient.linkSocial` (REST `/api/auth/link-social`)
│   │                → infra/better-auth.ts (instância + export type AuthInstance = typeof auth, usada no DI)
│   │                → use-case traduz APIError do better-auth → AuthActionFailedError (mensagens pt-BR), ex.: INVALID_PASSWORD→"Senha atual incorreta."
│   ├── assistant/   → context SUPPORTING: nlSearch (busca em linguagem natural). Recebe Todo[] via parâmetro
│   │                → caixa-preta, consumidora do aggregate de todos (Customer-Supplier), sem port próprio
│   └── insights/    → context SUPPORTING: summarizeDay (resumo do dia). Recebe Todo[] via parâmetro
│   │                → filtra '!completed' DENTRO do use-case (regra de negócio no domínio, não no resolver)
├── shared/
│   ├── ai/          → INFRA genérica: ai.service.interface.ts (port AiService, acessível em @/server/shared/ai/ai.service.interface,
│   │                → use-cases dependem SÓ do port) — adapter por provider em pasta própria com barrel (path público @/server/shared/ai/gemini)
│   │                → gemini/: gemini-ai.service.ts (GeminiAiService implements AiService) + gemini-schema.mapper.ts
│   │                → (converte zod → Schema Gemini; caso sem suporte → throws) + index.ts (exporta GeminiAiService)
│   ├── cache/       → cache.interface.ts (ICache get/set/delete com TTL) + redis/ (RedisCache, lazy connect, connectTimeout 2s,
│   │                → reconnectStrategy: false, JSON serialization, fallback silencioso) + index.ts singletons (RedisCache via env.REDIS_URL)
│   ├── oauth/       → INFRA genérica: oauth.interface.ts (AuthProvider = 'google'|'github' + port IOAuthService.getProviders)
│   │                → + oauth.service.ts (OAuthService via env.GOOGLE_*/GITHUB_*); singleton oauthService no container/infra.ts
│   └── errors/      → app.errors.ts — fonte ÚNICA de erros de aplicação: AppError base { code (string aberto), message }
│                    → + erros específicos (TodoNotFoundError, AuthenticationRequiredError, AuthActionFailedError);
│                    → sem errors.ts por módulo (contração: módulo ≥5 erros próprios pode voltar a ter arquivo local)
│   └── container/   → composition root: DI manual (sem inversify), resolve controladores; index.ts (agregador) + 1 arquivo por context
│                    → (todo/assistant/insights/auth) + infra.ts (serviços compartilhados). Todo: CachedTodoRepository(PrismaTodoRepository, cache)
├── config/          → environment.ts (env com parse zod, UPPERCASE: DATABASE_URL, GEMINI_API_KEY, GEMINI_MODEL, BETTER_AUTH_URL,
│                    → BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET, REDIS_URL default redis://localhost:6379)
├── db/              → prisma.ts (singleton) + generated/ (Prisma Client gerado)
└── utils/           → helpers genéricos

bff/                 → camada de apresentação de API (GraphQL) — NÚCLEO HEXAGONAL, espelha os bounded contexts
├── adapters/        → ports + adapters por context (a fronteira que o resolver consome)
│   ├── todo/        → todo.port.ts (interface TodoPort: CRUD + suggestTodo, SEM import de server/) + todo.adapter.ts
│   ├── assistant/   → assistant.port.ts (AssistantPort: nlSearch) + assistant.adapter.ts
│   ├── insights/    → insights.port.ts (InsightsPort: summarizeDay) + insights.adapter.ts
│   └── auth/        → auth.port.ts (AuthPort) + auth.adapter.ts (todas os métodos: me/perfil/email/senha/contas/sessões)
│   fluxo: resolver → ctx.adapters.todo (Port) → adapter → controller (server)
├── factories/       → instâncias dos adapters (1 pasta por context, ex.: auth.factory.ts) montadas por `bff/factories/index.ts`
├── context.ts       → GraphQLContext { adapters: { todo, assistant, insights, auth }, user: AuthUser|null, session: {id,token}|null, headers }
│                    → ÚNICO ponto que importa de server/ (composition root do BFF); resolve sessão via authUseCase.resolveSession(headers)
├── graphql.ts       → createGraphQLHandler() — Yoga com schema + context + maskedErrors (inclui maskError)
├── errors.ts        → erros do layer GraphQL: raiseResolvable + execute (mapeia AppError/ZodError → GraphQLError no resolver)
│                    → + maskError: AppError com code → GraphQLError { message, extensions.code }; resto → "Erro interno do servidor.", sem stack trace)
├── pothos/          → camada GraphQL/Pothos (builder, schema) + 1 pasta por bounded context
│   ├── builder.ts   → SchemaBuilder (tipagem Context + Scalars) + Query/Mutation raiz
│                    → + @pothos/plugin-scope-auth: scope loggedIn no queryType/mutationType (auth por campo declarativa,
│                    → sem requireUser); unauthorizedError → GraphQLError UNAUTHENTICATED; AuthContexts + t.authField/withAuth
│                    → (ctx.user não-null tipado); query pública usa skipTypeScopes (ex.: me)
│                    → + @pothos/plugin-with-input: mutations usam t.withAuth(...).fieldWithInput(...) — input inline com
│                    → t.input.X (removeu input types separados); withInput.typeOptions.name callback dropa prefixo Query/Mutation
│                    → (CreateTodoInput, UpdateTodoInput...); exceção: suggestTodo mantém nome DraftInput + arg draft (interface com client)
│   ├── scalars/     → scalars globais ({name}.ts + barrel index.ts): datetime.ts
│   ├── modules/     → bounded contexts do Pothos: todo/, assistant/, insights/, auth/
│   │                → auth/: queries me (nullable, skipTypeScopes), myAccounts, mySessions + mutations updateProfile, changeEmail, changePassword,
│   │                → unlinkAccount, revokeSession, revokeOtherSessions
│   │                → resolvers com user usam t.authField/withAuth (ctx.user não-null) e sanificam null → undefined no input;
│   │                → mutations com input usam fieldWithInput (sem arquivos de inputs separados — inputs declarados inline)
│   └── schema.ts    → importa scalars + modules (side-effect, barrels) e exporta builder.toSchema()
```

app/api/graphql/route.ts → endpoint GraphQL (createGraphQLHandler) — transporte fino
app/api/auth/[...all]/route.ts → toNextJsHandler(auth) — REST do Better Auth (fluxos de sessão, cookies automáticos)

## Regras da divisão

- **Frontend (Client Components) importa só de `lib/constants`, `lib/schemas` e `services/`** — nunca de `server/` nem `bff/`. `services/auth/*` + `services/graphql/*` são as únicas pontes de dados da UI.
- `server/` não depende de Next (`next/server`), nem de `app/api`; só de `lib/schemas` e de si mesmo. Testável sem mockar Next.
- `bff/pothos` importa de `bff/adapters` + `lib/` (camada de montagem de schema/resolvers). O server entra no BFF apenas pelo composition root em `bff/context.ts` (via `server/shared/container/`), nunca por import direto nos resolvers/adapters.
- App Router: route groups `(public)` (não autenticado: `/`, `/login`, `/register`) e `(private)` (autenticado: `/dashboard`, `/tarefas`, `/resumo`, `/busca`, `/settings`); `(private)/layout.tsx` chama `verifySession()`; `proxy.ts` bloqueia rotas protegidas sem cookie `better-auth.session_token` (redirect `/?next=`). Matcher exclui `api|_next/static|_next/image|favicon.ico|.*\..*`.
- Passo do Prisma: gerar client para `server/db/generated/prisma` (schema.prisma → output).
- Monorepo: Prisma/schema/seed rodam via `pnpm --filter @ia-task-manager/nextjs db:*` (CWD = `apps/nextjs`); `better-sqlite3` está em `serverExternalPackages` no `next.config.ts`.

## Convenções backend

- Tipar sempre com TypeScript explícito; sem `any` sem justificativa
- DDD: bounded contexts por domínio (`todos` core, `auth`/`assistant`/`insights` supporting) espelhados no BFF; assistant/insights são consumidores do aggregate `Todo` (recebem `Todo[]` via parâmetro, sem port próprio) — regra de negócio nunca vaza para o resolver
- IA é infra genérica (`server/shared/ai`): use-cases dependem do port `AiService` (raiz), nunca do SDK Gemini; troca de provider = novo adapter em `ai/<provider>/` (com barrel próprio), sem tocar nos contexts
- Camada de negócio (`server/modules`) isolada de HTTP/GraphQL (ports & adapters); `server/` nunca importa de `app/api` nem de `next/server`
- Validação de input com zod em todas as fronteiras
- Erros: `AppError` (code+message pt-BR) nas bordas do domínio, centralizado em `server/shared/errors/app.errors.ts`; use-case de auth traduz APIError do better-auth → `AuthActionFailedError`; Yoga `maskedErrors` expõe só message+code (nunca stack trace)
- Cache: cache-aside por `userId` (`todos:{userId}`, TTL 300s); invalidação em create/update/delete; cache nunca derruba consulta (fallback silencioso)
- Nomes reais dos métodos do better-auth `auth.api` (v1.7.5): `getSession`, `updateUser` (sem email; retorna `{status}` → re-buscar via getSession), `changeEmail` (requer `user.changeEmail.enabled`; retorna `{status}`), `changePassword` (`{token,user}` → retornar true), `listUserAccounts` (array direto), `unlinkAccount` (body: `accountId` = `Account.id`), `listSessions` (array direto), `revokeSession` (`{token,user}` → retornar true), `revokeOtherSessions` (`{status}`)
- Vínculo OAuth usa o client (`authClient.linkSocial`, rota `/link-social`) — o redirectPlugin do client faz `window.location.href` quando a resposta tem `{url, redirect:true}`; aqui o `linkAccount` GraphQL foi removido (sem uso)
- Estilo de código segue prettier (single quote, sem semicolon)
