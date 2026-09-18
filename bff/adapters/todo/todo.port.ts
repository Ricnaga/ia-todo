import type { Todo } from '@/lib/schemas/todo'
import type { TodoSuggestion } from '@/lib/schemas/todo'
import type { CreateTodoInput, UpdateTodoInput, DraftInput } from '@/lib/schemas/todo'

export type TodoCreateInput = CreateTodoInput
export type TodoUpdateInput = UpdateTodoInput
export type SuggestTodoInput = DraftInput

export interface TodoPort {
  list(): Promise<Todo[]>
  getById(id: string): Promise<Todo>
  create(input: TodoCreateInput): Promise<Todo>
  update(id: string, input: TodoUpdateInput): Promise<Todo>
  delete(id: string): Promise<void>
  suggestTodo(draft: SuggestTodoInput): Promise<TodoSuggestion>
}
