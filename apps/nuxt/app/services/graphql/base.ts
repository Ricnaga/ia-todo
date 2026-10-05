import { firstGraphQLError, GraphQLRequestError } from '@ia-task-manager/bff/graphql'
import { print } from 'graphql'
import type { RequestOptions } from './graphql.types'

type GraphQLResponse<TData> = {
  data?: TData
  errors?: unknown
}

export async function request<TResult, TVariables>({
  document,
  variables,
  headers: requestHeaders,
}: RequestOptions<TResult, TVariables>): Promise<TResult> {
  const response = await $fetch<GraphQLResponse<TResult>>('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...requestHeaders },
    body: { query: print(document), variables },
  })

  const failure = firstGraphQLError(response)
  if (failure) throw new GraphQLRequestError(failure.message, failure.extensions?.code)
  if (!response.data) throw new GraphQLRequestError('Resposta do GraphQL sem campo data.')

  return response.data
}
