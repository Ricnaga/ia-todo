import { invalidate } from '$app/navigation'
import { createMutation } from '$lib/utils/mutation.svelte'
import { insightsQueryKeys } from '$lib/services/insights/insights.keys'
import { todoQueryKeys } from './todo.keys'
import { createTodo, deleteTodo, suggestTodo, updateTodo } from './todo.request'
import {
  toTodoCreateRequest,
  toTodoUpdateRequest,
  type TodoDraft,
  type TodoUpdateDraft,
} from '@ia-task-manager/bff/graphql'
import type { DraftInput } from '@ia-task-manager/schemas/todo'

async function invalidateTodoWrites(
  keys: readonly string[] = todoQueryKeys.writeTargets(),
): Promise<void> {
  await Promise.all([...keys, insightsQueryKeys.daySummary].map((key) => invalidate(key)))
  return undefined
}

export function useCreateTodoMutation(keys?: readonly string[]) {
  return createMutation({
    mutationFn: (draft: TodoDraft) => createTodo(toTodoCreateRequest(draft)),
    onSuccess: () => invalidateTodoWrites(keys),
  })
}

export function useUpdateTodoMutation(keys?: readonly string[]) {
  return createMutation({
    mutationFn: ({ id, input }: { id: string; input: TodoUpdateDraft }) =>
      updateTodo(id, toTodoUpdateRequest(input)),
    onSuccess: () => invalidateTodoWrites(keys),
  })
}

export function useDeleteTodoMutation(keys?: readonly string[]) {
  return createMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => invalidateTodoWrites(keys),
  })
}

export function useSuggestTodoMutation() {
  return createMutation({
    mutationFn: (draft: DraftInput) => suggestTodo(draft),
  })
}
