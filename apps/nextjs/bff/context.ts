import { adapters } from '@/bff/adapters'
import type { Adapters } from '@/bff/adapters'
import type { AuthSession, AuthUser } from '@/lib/schemas/auth'
import { authUseCase } from '@/server/shared/container'

export type GraphQLContext = {
  adapters: Adapters
  user: AuthUser | null
  session: Pick<AuthSession, 'id' | 'token'> | null
  headers: Headers
}

export const createContext =
  () =>
  async ({ request }: { request: Request }): Promise<GraphQLContext> => {
    const headers = request.headers
    const session = await authUseCase.resolveSession(headers)
    return {
      adapters,
      user: session?.user ?? null,
      session: session?.session ?? null,
      headers,
    }
  }
