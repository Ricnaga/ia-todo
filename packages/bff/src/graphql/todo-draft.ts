import type { CreateTodoFormInput, TodoSuggestion } from '@ia-task-manager/schemas/todo'
import type { TodoCreateRequest, TodoUpdateRequest } from './requests'

export type TodoDraft = CreateTodoFormInput | TodoSuggestion

export type TodoUpdateDraft = CreateTodoFormInput | { completed: boolean }

function toDateInput(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() ? value : null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString()
  return null
}

function toDescriptionInput(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return value
  if (typeof value === 'string') return value.trim() ? value : null
  return undefined
}

export function toTodoCreateRequest(draft: TodoDraft): TodoCreateRequest {
  return {
    title: draft.title,
    description: toDescriptionInput(draft.description),
    priority: draft.priority,
    dueDate: 'dueDate' in draft ? toDateInput(draft.dueDate) : null,
  }
}

export function toTodoUpdateRequest(draft: TodoUpdateDraft): TodoUpdateRequest {
  if ('completed' in draft) return { completed: draft.completed }
  return toTodoCreateRequest(draft)
}
