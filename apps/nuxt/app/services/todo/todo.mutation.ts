import { refreshNuxtData, clearNuxtData } from '#imports'
import { useMutation } from '~/composables/useMutation'
import { insightsQueryKeys } from '~/services/insights/insights.keys'
import { todoQueryKeys } from './todo.keys'
import { createTodo, deleteTodo, suggestTodo, updateTodo } from './todo.request'
import {
  toTodoCreateRequest,
  toTodoUpdateRequest,
  type TodoDraft,
  type TodoUpdateDraft,
} from '@ia-task-manager/bff/graphql'
import type { DraftInput } from '@ia-task-manager/schemas/todo'

function invalidateTodoWrites(): Promise<void> {
  return refreshNuxtData([...todoQueryKeys.writeTargets(), insightsQueryKeys.daySummary])
}

export function useCreateTodoMutation() {
  return useMutation({
    mutationFn: (draft: TodoDraft) => createTodo(toTodoCreateRequest(draft)),
    onSuccess: invalidateTodoWrites,
  })
}

export function useUpdateTodoMutation() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TodoUpdateDraft }) =>
      updateTodo(id, toTodoUpdateRequest(input)),
    onSuccess: (_todo, { id }) => {
      clearNuxtData(todoQueryKeys.detail(id))
      return invalidateTodoWrites()
    },
  })
}

export function useDeleteTodoMutation() {
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_deleted, id) => {
      clearNuxtData(todoQueryKeys.detail(id))
      return invalidateTodoWrites()
    },
  })
}

export function useSuggestTodoMutation() {
  return useMutation({
    mutationFn: (draft: DraftInput) => suggestTodo(draft),
  })
}
