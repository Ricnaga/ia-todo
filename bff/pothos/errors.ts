import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'
import { DomainError } from '@/server/modules/todos/errors'

export function raiseResolvable(error: unknown): never {
  if (error instanceof DomainError) {
    throw new GraphQLError(error.message, { extensions: { code: error.code } })
  }
  if (error instanceof ZodError) {
    throw new GraphQLError(error.issues.map((issue) => issue.message).join('; '))
  }
  throw error instanceof Error ? error : new Error(String(error))
}

export function execute<T>(work: () => Promise<T>): Promise<T> {
  return work().catch((error: unknown) => {
    raiseResolvable(error)
  })
}
