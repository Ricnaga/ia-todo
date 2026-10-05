import type { CreateTodoFormInput, TodoSuggestion } from '@ia-task-manager/schemas/todo'
import type { TodoCreateRequest, TodoUpdateRequest } from './requests'

export type TodoDraft = CreateTodoFormInput | TodoSuggestion

export type TodoUpdateDraft = CreateTodoFormInput | { completed: boolean }

export function toTodoCreateRequest(draft: TodoDraft): TodoCreateRequest {
  return {
    title: draft.title,
    description: draft.description,
    priority: draft.priority,
    dueDate: 'dueDate' in draft && typeof draft.dueDate === 'string' ? draft.dueDate : null,
  }
}

export function toTodoUpdateRequest(draft: TodoUpdateDraft): TodoUpdateRequest {
  if ('completed' in draft) return { completed: draft.completed }
  return toTodoCreateRequest(draft)
}
