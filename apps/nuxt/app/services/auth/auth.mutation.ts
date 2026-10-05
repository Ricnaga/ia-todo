import { refreshNuxtData } from '#imports'
import { useMutation } from '~/composables/useMutation'
import { setCachedData } from '~/composables/useCachedData'
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

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (input: UpdateProfileRequest) => updateProfile(input),
    onSuccess: (user) => {
      setCachedData(authQueryKeys.me, user)
    },
  })
}

export function useChangeEmailMutation() {
  return useMutation({
    mutationFn: (input: ChangeEmailRequest) => changeEmail(input),
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (input: ChangePasswordRequest) => changePassword(input),
  })
}

export function useUnlinkAccountMutation() {
  return useMutation({
    mutationFn: (input: UnlinkAccountRequest) => unlinkAccount(input),
    onSuccess: () => refreshNuxtData([authQueryKeys.accounts]),
  })
}

export function useRevokeSessionMutation() {
  return useMutation({
    mutationFn: (input: RevokeSessionRequest) => revokeSession(input),
    onSuccess: () => refreshNuxtData([authQueryKeys.sessions]),
  })
}

export function useRevokeOtherSessionsMutation() {
  return useMutation({
    mutationFn: () => revokeOtherSessions(),
    onSuccess: () => refreshNuxtData([authQueryKeys.sessions]),
  })
}
