import { firstGraphQLError, GraphQLRequestError } from '@ia-task-manager/bff/graphql'
import { ClientError, GraphQLClient } from 'graphql-request'
import type { RequestOptions } from './graphql.types'

function toRequestError(error: ClientError): GraphQLRequestError {
  const payload = firstGraphQLError(error.response)
  return new GraphQLRequestError(payload?.message ?? error.message, payload?.extensions?.code)
}

let browserClient: GraphQLClient | undefined

const REGISTRY = Symbol.for('@ia-task-manager/nextjs/graphql')

type ServerRegistry = { client?: GraphQLClient }

function serverRegistry(): ServerRegistry {
  const store = globalThis as { [REGISTRY]?: ServerRegistry }
  store[REGISTRY] ??= {}
  return store[REGISTRY]
}

export function setServerGraphQLClient(client: GraphQLClient): void {
  serverRegistry().client = client
}

const SEM_TRANSPORTE =
  'GraphQL: o transporte do servidor nao foi registrado. `instrumentation.ts` ' +
  'tem que estar na raiz do app e chamar `register()`; sem ele, o SSR nao tem ' +
  'como falar com o BFF sem sair pela rede.'

function getClient(): GraphQLClient {
  if (typeof window === 'undefined') {
    const client = serverRegistry().client
    if (!client) throw new Error(SEM_TRANSPORTE)
    return client
  }

  browserClient ??= new GraphQLClient(`${window.location.origin}/api/graphql`)
  return browserClient
}

export async function request<TResult, TVariables extends object>({
  document,
  variables,
  headers,
}: RequestOptions<TResult, TVariables>): Promise<TResult> {
  try {
    return await getClient().request<TResult, object>(document, variables, headers)
  } catch (error) {
    if (error instanceof ClientError) {
      throw toRequestError(error)
    }
    throw error
  }
}
