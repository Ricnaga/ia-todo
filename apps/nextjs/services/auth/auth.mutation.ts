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
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  RevokeSessionRequest,
  UnlinkAccountRequest,
  UpdateProfileRequest,
} from './auth.types'
import { authQueryKeys } from './auth.keys'

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation<AuthUser, Error, UpdateProfileRequest>({
    mutationFn: (input) => updateProfileRequest(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.me, user)
    },
  })
}

export function useChangeEmailMutation() {
  return useMutation<boolean, Error, ChangeEmailRequest>({
    mutationFn: (input) => changeEmailRequest(input),
  })
}

export function useChangePasswordMutation() {
  return useMutation<boolean, Error, ChangePasswordRequest>({
    mutationFn: (input) => changePasswordRequest(input),
  })
}

export function useUnlinkAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation<boolean, Error, UnlinkAccountRequest>({
    mutationFn: (input) => unlinkAccountRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authQueryKeys.accounts }),
  })
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient()
  return useMutation<boolean, Error, RevokeSessionRequest>({
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
