import { ClientError, GraphQLClient } from 'graphql-request'

type RequestHeaders = Record<string, string>

export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED'

export class GraphQLRequestError extends Error {
  readonly code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'GraphQLRequestError'
    this.code = code
  }
}

function getApiBaseUrl(): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000')
  return `${base.replace(/\/+$/, '')}/api/graphql`
}

export const client = new GraphQLClient(getApiBaseUrl())

function toRequestError(error: ClientError): GraphQLRequestError {
  const graphQLError = error.response.errors?.[0]
  const code = graphQLError?.extensions?.code
  return new GraphQLRequestError(
    graphQLError?.message ?? error.message,
    typeof code === 'string' ? code : undefined,
  )
}

export async function request<T>(
  document: string,
  variables?: Record<string, unknown>,
  requestHeaders?: RequestHeaders,
): Promise<T> {
  try {
    return await client.request<T>(document, variables, requestHeaders)
  } catch (error) {
    if (error instanceof ClientError) {
      throw toRequestError(error)
    }
    throw error
  }
}
