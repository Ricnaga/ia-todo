import { refreshNuxtData, clearNuxtData } from '#imports'
import { useMutation } from '~/composables/useMutation'
import { insightsQueryKeys } from '~/services/insights/insights.keys'
import { todoQueryKeys } from './todo.keys'
import { createTodo, deleteTodo, suggestTodo, updateTodo } from './todo.request'
import type { TodoCreateRequest, TodoUpdateRequest } from './todo.types'
import type { CreateTodoFormInput, DraftInput, TodoSuggestion } from '@ia-task-manager/schemas/todo'

export type TodoDraft = CreateTodoFormInput | TodoSuggestion
export type TodoUpdateDraft = CreateTodoFormInput | { completed: boolean }

const toTodoCreateRequest = (draft: TodoDraft): TodoCreateRequest => ({
  title: draft.title,
  description: draft.description,
  priority: draft.priority,
  dueDate: 'dueDate' in draft && typeof draft.dueDate === 'string' ? draft.dueDate : null,
})

const toTodoUpdateRequest = (draft: TodoUpdateDraft): TodoUpdateRequest => {
  if ('completed' in draft) return { completed: draft.completed }
  return toTodoCreateRequest(draft)
}

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
