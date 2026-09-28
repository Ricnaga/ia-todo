import { isAPIError } from 'better-auth/api'
import {
  AUTH_ERROR_MESSAGES,
  GENERIC_ERROR_MESSAGE,
  type AuthErrorCode,
} from '../constants/error.constants'
import { AuthActionFailedError } from '../../../shared/errors/app.errors'

export async function runAuthAction<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action()
  } catch (error) {
    throw new AuthActionFailedError(authErrorMessage(error))
  }
}

function authErrorMessage(error: unknown): string {
  if (!isAPIError(error)) return GENERIC_ERROR_MESSAGE
  const code = error.body?.code as AuthErrorCode | undefined
  return (
    (code ? AUTH_ERROR_MESSAGES[code] : undefined) ?? error.body?.message ?? GENERIC_ERROR_MESSAGE
  )
}
