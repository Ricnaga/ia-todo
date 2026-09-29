import 'server-only'

import { createGraphQLHandler } from '@ia-task-manager/bff'
import { GraphQLClient } from 'graphql-request'

/**
 * A URL nao e consultada: o `fetch` abaixo responde sem sair do processo, e o
 * Yoga so le `request.url` para casar com o `graphqlEndpoint`. Ela existe
 * porque o construtor do `GraphQLClient` exige uma URL valida.
 */
const INTERNAL_URL = 'http://graphql.internal/api/graphql'

/**
 * `graphql-request` aceita um `fetch` proprio, e e por ele que o transporte
 * in-process entra sem reescrever o `request()`: o cliente continua montando o
 * `Request` (query, variables e os `requestHeaders`, que carregam o cookie da
 * sessao) e continua aplicando o mesmo tratamento de status e erro. Um `fetch`
 * proprio que responde na hora e o caminho curto para o Yoga, que ja e um
 * handler de fetch.
 */
export function createServerGraphQLClient(): GraphQLClient {
  const handleGraphQL = createGraphQLHandler()

  /**
   * `graphql-request` chama `fetch` com a forma `(url, init)`, entao os dois
   * argumentos precisam ser remontados em um `Request` -- usar so a `url`
   * descartaria o `init` e o Yoga receberia um POST sem corpo.
   */
  async function inProcessFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return handleGraphQL(new Request(input, init))
  }

  return new GraphQLClient(INTERNAL_URL, {
    fetch: inProcessFetch as typeof globalThis.fetch,
  })
}
