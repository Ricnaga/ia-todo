import { adapters } from './adapters'
import type { Adapters } from './adapters'
import type { AuthSession, AuthUser } from '@ia-task-manager/schemas/auth'
import { authUseCase } from '@ia-task-manager/server/containers'

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
