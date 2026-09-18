import { ClientError, GraphQLClient } from 'graphql-request'

export const client = new GraphQLClient('/api/graphql')

export async function request<T>(
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await client.request<T>(document, variables)
  } catch (error) {
    if (error instanceof ClientError) {
      throw new Error(error.response.errors?.[0]?.message ?? error.message)
    }
    throw error
  }
}
