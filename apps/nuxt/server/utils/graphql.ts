/**
 * O Yoga e um fetch handler: recebe um `Request` e devolve um `Response`. O
 * `server/api/graphql.ts` so embrulha este handler num event handler do h3.
 *
 * Fica em `server/utils` (raiz do Nitro, nunca empacotado no client) porque o
 * `@ia-task-manager/bff` puxa Prisma, better-auth e Redis: se este arquivo
 *assegurasse o handler, ele entraria no bundle do browser.
 *
 * `graphqlEndpoint` e `/api/graphql`, o mesmo path do app Next e do SvelteKit,
 * entao os tres fronts servem o endpoint no mesmo lugar.
 */
import { createGraphQLHandler } from '@ia-task-manager/bff'

export const yoga = createGraphQLHandler()
