import type { Document } from '@ia-task-manager/bff/graphql'

export type GraphQLFetch = typeof fetch

export type RequestOptions<TResult, TVariables> = {
  document: Document<TResult, TVariables>
  variables?: TVariables
  graphqlFetch?: GraphQLFetch
}
