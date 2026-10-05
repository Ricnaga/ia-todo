import { firstGraphQLError } from '@ia-task-manager/bff/graphql'
import { print } from 'graphql'
import type { RequestOptions } from './graphql.types'

export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED'

type GraphQLResponse<TData> = {
  data?: TData
  errors?: unknown
}

export class GraphQLRequestError extends Error {
  readonly code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'GraphQLRequestError'
    this.code = code
  }
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
