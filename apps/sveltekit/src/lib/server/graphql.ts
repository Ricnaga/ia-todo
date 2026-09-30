/**
 * O Yoga e um fetch handler: recebe um `Request` e devolve um `Response`. O
 * `routes/api/graphql/+server.ts` so embrulha este handler num RequestHandler.
 *
 * Fica em `$lib/server` porque o SvelteKit proibe importar esse diretorio a
 * partir do client -- e o `@ia-task-manager/bff` puxa Prisma, better-auth e
 * Redis, que nunca podem entrar no bundle do browser.
 *
 * `graphqlEndpoint` e `/api/graphql`, o mesmo path do app Next e do Nuxt, entao
 * os tres fronts servem o endpoint no mesmo lugar.
 */
import { createGraphQLHandler } from '@ia-task-manager/bff'

export const yoga = createGraphQLHandler()
