import type { Todo, TodoPriority } from '@/lib/schemas/todo'
import type { TodoSuggestion } from '@/lib/schemas/todo'

export type TodoCreateInput = {
  title: string
  description?: string | null
  priority?: TodoPriority | null
  dueDate?: Date | null
}

export type TodoUpdateInput = {
  title?: string | null
  description?: string | null
  priority?: TodoPriority | null
  dueDate?: Date | null
  completed?: boolean | null
}

export type SuggestTodoInput = {
  title?: string | null
  description?: string | null
}

export interface TodoPort {
  list(): Promise<Todo[]>
  getById(id: string): Promise<Todo>
  create(input: TodoCreateInput): Promise<Todo>
  update(id: string, input: TodoUpdateInput): Promise<Todo>
  delete(id: string): Promise<void>
  suggestTodo(draft: SuggestTodoInput): Promise<TodoSuggestion>
}
