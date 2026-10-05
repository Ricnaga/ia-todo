import { invalidate } from '$app/navigation'
import { createMutation } from '$lib/utils/mutation'
import { authQueryKeys } from './auth.keys'
import {
  changeEmail,
  changePassword,
  revokeOtherSessions,
  revokeSession,
  unlinkAccount,
  updateProfile,
} from './auth.request'
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  RevokeSessionRequest,
  UnlinkAccountRequest,
  UpdateProfileRequest,
} from './auth.types'

/**
 * A invalidacao e por dependencia exata e a mutation nao sabe quais tags a rota
 * declarou — quem chama passa o que a rota usou em `depends()`.
 */
async function invalidateKeys(keys: readonly string[]): Promise<void> {
  await Promise.all(keys.map((key) => invalidate(key)))
}

export function useUpdateProfileMutation() {
  return createMutation({
    mutationFn: (input: UpdateProfileRequest) => updateProfile(input),
  })
}

export function useChangeEmailMutation() {
  return createMutation({
    mutationFn: (input: ChangeEmailRequest) => changeEmail(input),
  })
}

export function useChangePasswordMutation() {
  return createMutation({
    mutationFn: (input: ChangePasswordRequest) => changePassword(input),
  })
}

export function useUnlinkAccountMutation(keys: readonly string[] = [authQueryKeys.accounts]) {
  return createMutation({
    mutationFn: (input: UnlinkAccountRequest) => unlinkAccount(input),
    onSuccess: () => invalidateKeys(keys),
  })
}

export function useRevokeSessionMutation(keys: readonly string[] = [authQueryKeys.sessions]) {
  return createMutation({
    mutationFn: (input: RevokeSessionRequest) => revokeSession(input),
    onSuccess: () => invalidateKeys(keys),
  })
}

export function useRevokeOtherSessionsMutation(keys: readonly string[] = [authQueryKeys.sessions]) {
  return createMutation({
    mutationFn: () => revokeOtherSessions(),
    onSuccess: () => invalidateKeys(keys),
  })
}
