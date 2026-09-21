# TODO — ia-task-manager

> Plano de evolução do projeto (estudo/portfólio). Decisões de arquitetura
>
> - roadmap por fases, com commits por contexto (pt-BR, conventional commits).
>   Marque `[x]` no item conforme executar.

## Estado atual (feito)

- [x] Schemas por contexto com barrel (`lib/schemas/{context}/`) e `todo.io.ts` (z.input/z.output)
- [x] DIP nos controllers: `I<Context>UseCase` (todo, assistant, insights)
- [x] `ITodoRepository` + PrismaClient injetado no `PrismaTodoRepository`
- [x] Composition root em `server/shared/container/` (`index.ts` agregador + `infra.ts` + 1 arquivo/context)
- [x] Mapper Gemini migrado para API pública do zod 4 (`.def`, sem `_def`/`isOptional` deprecados)

## Fase 0 — Fundação de identidade

- [ ] Prisma: modelos do Better Auth (`user`, `session`, `account`, `verification`) + `Todo.userId` (FK + index) + migração
- [ ] Env: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`
- [ ] Better Auth: email/password + Google + GitHub + account linking (docs via Context7; guias em `node_modules/next/dist/docs/` antes de código Next)

## Fase 1 — Auth + painel de contas (GraphQL)

- [ ] `server/modules/auth` + port `IAuthService` (sessão, perfil, senha, contas vinculadas, sessões) + `container/auth.ts`
- [ ] BFF: `ctx.user` (sessão do request) + guard autenticado nas protected queries/mutations
- [ ] Scoping de negócio por `userId` (repo/use-cases/ports/assistant-insights via `todo.list()`)
- [ ] GraphQL: módulo `auth` (`signUp`/`signIn`/`signOut` + `loginOAuth` URL) e `accounts` (`me`, `updateProfile`, `changePassword`, `listAccounts`, `linkOAuth`, `unlinkAccount`, `listSessions`, `revokeSession`)
- [ ] Frontend: `/login` (credenciais + Google/GitHub) + gating de rotas protegidas
- [ ] Frontend: `/settings` (Perfil, Segurança, Contas vinculadas, Sessões ativas)

## Fase 2 — Billing (Stripe)

- [ ] Port `server/shared/billing/` + adapter em `billing/stripe/` (checkout, webhook, subscription)
- [ ] Webhook `app/api/webhooks/stripe/route.ts`
- [ ] Gating de planos (free/paid) no use-case de IA (regra de domínio isolada do provider)
- [ ] Frontend: página de planos/assinatura

## Convenções

- Commits em pt-BR, conventional commits com escopo, atômicos por contexto
- Fronteiras: front importa só `lib/` + `services/`; server não depende de Next; BFF limpo de server exceto pelos adapters
- Auth/contas via GraphQL; REST do Better Auth só como encanamento do redirect OAuth (callback)
- Novos adapters por provider em pasta própria com barrel (padrão `ai/<provider>/`)
