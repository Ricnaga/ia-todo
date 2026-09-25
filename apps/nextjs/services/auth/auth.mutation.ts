import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AuthUser } from '@ia-task-manager/schemas/auth'
import {
  updateProfileRequest,
  changeEmailRequest,
  changePasswordRequest,
  unlinkAccountRequest,
  revokeSessionRequest,
  revokeOtherSessionsRequest,
} from './auth.request'
import { authQueryKeys } from './auth.keys'

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation<AuthUser, Error, { name?: string; image?: string | null }>({
    mutationFn: (input) => updateProfileRequest(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.me, user)
    },
  })
}

export function useChangeEmailMutation() {
  return useMutation<boolean, Error, { newEmail: string; callbackURL?: string }>({
    mutationFn: (input) => changeEmailRequest(input),
  })
}

export function useChangePasswordMutation() {
  return useMutation<boolean, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: (input) => changePasswordRequest(input),
  })
}

export function useUnlinkAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation<boolean, Error, { accountId: string }>({
    mutationFn: (input) => unlinkAccountRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authQueryKeys.accounts }),
  })
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient()
  return useMutation<boolean, Error, { token: string }>({
    mutationFn: (input) => revokeSessionRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions }),
  })
}

export function useRevokeOtherSessionsMutation() {
  const queryClient = useQueryClient()
  return useMutation<boolean, Error>({
    mutationFn: () => revokeOtherSessionsRequest(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions }),
  })
}
