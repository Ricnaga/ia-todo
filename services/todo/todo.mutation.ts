import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTodo as createTodoRequest,
  deleteTodo as deleteTodoRequest,
  suggestTodo as suggestTodoRequest,
  updateTodo as updateTodoRequest,
} from '@/lib/graphql/client'
import type { TodoCreateRequest, TodoUpdateRequest } from '@/lib/graphql/client'
import type { Todo } from '@/lib/schemas/todo'
import type { TodoSuggestion } from '@/lib/schemas/todo'
import type { CreateTodoFormInput } from '@/lib/schemas/todo'
import { todoQueryKeys } from './todo.keys'

function useInvalidateTodos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: todoQueryKeys.all })
}

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
    mutationFn: (id: string): Promise<void> => deleteTodoRequest(id),
    onSuccess: invalidateTodos,
  })
}
