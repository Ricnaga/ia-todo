import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTodo as createTodoRequest,
  deleteTodo as deleteTodoRequest,
  suggestTodo as suggestTodoRequest,
  updateTodo as updateTodoRequest,
} from './todo.request'
import {
  toTodoCreateRequest,
  toTodoUpdateRequest,
  type TodoDraft,
  type TodoUpdateDraft,
} from '@ia-task-manager/bff/graphql'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { insightsQueryKeys } from '@/services/insights/insights.keys'
import { todoQueryKeys } from './todo.keys'

function useInvalidateTodos() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: todoQueryKeys.all })
    queryClient.invalidateQueries({ queryKey: insightsQueryKeys.daySummary })
  }
}

export function useCreateTodoMutation() {
  const invalidateTodos = useInvalidateTodos()
  return useMutation({
    mutationFn: (draft: TodoDraft): Promise<Todo> => createTodoRequest(toTodoCreateRequest(draft)),
    onSuccess: invalidateTodos,
  })
}

export function useUpdateTodoMutation() {
  const invalidateTodos = useInvalidateTodos()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TodoUpdateDraft }): Promise<Todo> =>
      updateTodoRequest(id, toTodoUpdateRequest(input)),
    onSuccess: invalidateTodos,
  })
}

export function useSuggestTodoMutation() {
  return useMutation({ mutationFn: suggestTodoRequest })
}

export function useDeleteTodoMutation() {
  const invalidateTodos = useInvalidateTodos()
  return useMutation({
    mutationFn: (id: string): Promise<boolean> => deleteTodoRequest(id),
    onSuccess: invalidateTodos,
  })
}
