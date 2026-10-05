export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { setServerGraphQLClient } = await import('@/services/graphql/base')
  const { createServerGraphQLClient } = await import('@/services/graphql/server')

  setServerGraphQLClient(createServerGraphQLClient())
}
