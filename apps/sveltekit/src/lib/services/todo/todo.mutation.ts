import { invalidate } from '$app/navigation'
import { createMutation } from '$lib/utils/mutation'
import { insightsQueryKeys } from '$lib/services/insights/insights.keys'
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

/**
 * A invalidacao e por dependencia exata, entao a mutation nao consegue saber
 * quais tags a rota declarou em `depends()` — quem chama passa o que a rota
 * pediu. `invalidateAll()` nao e usado: ele re-executa tudo e so funciona no
 * browser.
 */
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
