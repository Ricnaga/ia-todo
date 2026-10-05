import type {
  ChangeEmailMutationVariables,
  ChangePasswordMutationVariables,
  RevokeSessionMutationVariables,
  UnlinkAccountMutationVariables,
  UpdateProfileMutationVariables,
} from '@ia-task-manager/bff/graphql'

export type UpdateProfileRequest = UpdateProfileMutationVariables['input']
export type ChangeEmailRequest = ChangeEmailMutationVariables['input']
export type ChangePasswordRequest = ChangePasswordMutationVariables['input']
export type UnlinkAccountRequest = UnlinkAccountMutationVariables['input']
export type RevokeSessionRequest = RevokeSessionMutationVariables['input']
