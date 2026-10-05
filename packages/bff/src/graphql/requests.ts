import type {
  ChangeEmailMutationVariables,
  ChangePasswordMutationVariables,
  CreateTodoMutationVariables,
  RevokeSessionMutationVariables,
  UnlinkAccountMutationVariables,
  UpdateProfileMutationVariables,
  UpdateTodoMutationVariables,
} from './generated/graphql'

export type TodoCreateRequest = CreateTodoMutationVariables['input']
export type TodoUpdateRequest = UpdateTodoMutationVariables['input']

export type UpdateProfileRequest = UpdateProfileMutationVariables['input']
export type ChangeEmailRequest = ChangeEmailMutationVariables['input']
export type ChangePasswordRequest = ChangePasswordMutationVariables['input']
export type UnlinkAccountRequest = UnlinkAccountMutationVariables['input']
export type RevokeSessionRequest = RevokeSessionMutationVariables['input']
