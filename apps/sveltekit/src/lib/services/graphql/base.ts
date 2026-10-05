import { firstGraphQLError, GraphQLRequestError } from '@ia-task-manager/bff/graphql'
import { print } from 'graphql'
import type { RequestOptions } from './graphql.types'

export async function request<TResult, TVariables>({
  document,
  variables,
  graphqlFetch = fetch,
}: RequestOptions<TResult, TVariables>): Promise<TResult> {
  const response = await graphqlFetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: print(document), variables }),
  })

  const payload = (await response.json()) as { data?: TResult; errors?: unknown }

  const failure = firstGraphQLError(payload)
  if (failure) throw new GraphQLRequestError(failure.message, failure.extensions?.code)
  if (!payload.data) throw new GraphQLRequestError('Resposta do GraphQL sem campo data.')

  return payload.data
}
