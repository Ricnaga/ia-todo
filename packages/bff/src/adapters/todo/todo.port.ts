import type { Todo } from '@ia-task-manager/schemas/todo'
import type { TodoSuggestion } from '@ia-task-manager/schemas/todo'
import type { CreateTodoInput, UpdateTodoInput, DraftInput } from '@ia-task-manager/schemas/todo'

export type TodoCreateInput = CreateTodoInput
export type TodoUpdateInput = UpdateTodoInput
export type SuggestTodoInput = DraftInput

export interface TodoPort {
  list(userId: string): Promise<Todo[]>
  getById(id: string, userId: string): Promise<Todo>
  create(input: TodoCreateInput, userId: string): Promise<Todo>
  update(id: string, input: TodoUpdateInput, userId: string): Promise<Todo>
  delete(id: string, userId: string): Promise<void>
  suggestTodo(draft: SuggestTodoInput): Promise<TodoSuggestion>
}
