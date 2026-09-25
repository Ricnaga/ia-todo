import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'
import { AppError } from '@/server/shared/errors/app.errors'

export const INTERNAL_SERVER = {
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Erro interno do servidor.',
} as const

export function raiseResolvable(error: unknown): never {
  if (error instanceof AppError) {
    throw new GraphQLError(error.message, { extensions: { code: error.code } })
  }
  if (error instanceof ZodError) {
    throw new GraphQLError(error.issues.map((issue) => issue.message).join('; '))
  }
  throw error instanceof Error ? error : new Error(String(error))
}

export async function execute<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error: unknown) {
    raiseResolvable(error)
  }
}

function isResolvable(value: unknown): value is { code: string; message: string } {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record.code === 'string' && typeof record.message === 'string'
}

function readExtension(error: unknown, key: string): unknown {
  if (typeof error !== 'object' || error === null) return undefined
  const record = error as Record<string, unknown>
  const extensions = record.extensions
  if (typeof extensions !== 'object' || extensions === null) return undefined
  return (extensions as Record<string, unknown>)[key]
}

export function maskError(error: unknown, defaultMessage: string): Error {
  const original = readExtension(error, 'originalError')
  if (isResolvable(original)) {
    return new GraphQLError(original.message, { extensions: { code: original.code } })
  }

  const code = readExtension(error, 'code')
  if (typeof code === 'string') {
    const message = isResolvable(error) ? error.message : defaultMessage
    return new GraphQLError(message, { extensions: { code } })
  }

  return new GraphQLError(INTERNAL_SERVER.message, {
    extensions: { code: INTERNAL_SERVER.code },
  })
}
