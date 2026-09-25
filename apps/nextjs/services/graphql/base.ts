import { ClientError, GraphQLClient } from 'graphql-request'

type RequestHeaders = Record<string, string>

function getApiBaseUrl(): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000')
  return `${base.replace(/\/+$/, '')}/api/graphql`
}

export const client = new GraphQLClient(getApiBaseUrl())

export async function request<T>(
  document: string,
  variables?: Record<string, unknown>,
  requestHeaders?: RequestHeaders,
): Promise<T> {
  try {
    return await client.request<T>(document, variables, requestHeaders)
  } catch (error) {
    if (error instanceof ClientError) {
      throw new Error(error.response.errors?.[0]?.message ?? error.message)
    }
    throw error
  }
}
