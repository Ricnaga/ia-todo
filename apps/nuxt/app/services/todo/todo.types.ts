import type {
  CreateTodoMutationVariables,
  UpdateTodoMutationVariables,
} from '@ia-task-manager/bff/graphql'

export type TodoCreateRequest = CreateTodoMutationVariables['input']
export type TodoUpdateRequest = UpdateTodoMutationVariables['input']
