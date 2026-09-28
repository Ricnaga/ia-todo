import type { Todo, TodoPriority } from '@ia-task-manager/schemas/todo'

export type PromptTodo = {
  title: string
  description: string | null
  priority: TodoPriority
  dueDate: string | null
  subtasks: string[]
}

export function toPromptTodo(todo: Todo): PromptTodo {
  return {
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    dueDate: todo.dueDate?.toISOString() ?? null,
    subtasks: todo.subtasks?.map((subtask) => subtask.title) ?? [],
  }
}
