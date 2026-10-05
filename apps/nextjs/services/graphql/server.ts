import 'server-only'

import { createGraphQLHandler } from '@ia-task-manager/bff'
import { GraphQLClient } from 'graphql-request'

const INTERNAL_URL = 'http://graphql.internal/api/graphql'

export function createServerGraphQLClient(): GraphQLClient {
  const handleGraphQL = createGraphQLHandler()

  async function inProcessFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return handleGraphQL(new Request(input, init))
  }

  return new GraphQLClient(INTERNAL_URL, {
    fetch: inProcessFetch as typeof globalThis.fetch,
  })
}
