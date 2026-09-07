import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTodo as createTodoRequest,
  deleteTodo as deleteTodoRequest,
  updateTodo as updateTodoRequest,
} from '@/lib/graphql/client'
import type { TodoCreateRequest, TodoUpdateRequest } from '@/lib/graphql/client'
import type { Todo } from '@/lib/shared/todos/todo.types'
import { todoQueryKeys } from './todo.keys'

function useInvalidateTodos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: todoQueryKeys.all })
}

export function useCreateTodo() {
  const invalidateTodos = useInvalidateTodos()
  return useMutation({
    mutationFn: (input: unknown): Promise<Todo> => createTodoRequest(input as TodoCreateRequest),
    onSuccess: invalidateTodos,
  })
}

export function useUpdateTodo() {
  const invalidateTodos = useInvalidateTodos()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: unknown }): Promise<Todo> =>
      updateTodoRequest(id, input as TodoUpdateRequest),
    onSuccess: invalidateTodos,
  })
}

export function useDeleteTodo() {
  const invalidateTodos = useInvalidateTodos()
  return useMutation({
    mutationFn: (id: string): Promise<void> => deleteTodoRequest(id),
    onSuccess: invalidateTodos,
  })
}
