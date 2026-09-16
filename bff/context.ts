import { adapters } from '@/bff/adapters'
import type { Adapters } from '@/bff/adapters'

export type GraphQLContext = {
  adapters: Adapters
}

export const createContext = () => (): GraphQLContext => ({ adapters })
