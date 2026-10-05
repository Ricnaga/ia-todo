import type { Document } from '@ia-task-manager/bff/graphql'

export type RequestHeaders = Record<string, string>

export type RequestOptions<TResult, TVariables> = {
  document: Document<TResult, TVariables>
  variables?: TVariables
  headers?: RequestHeaders
}
