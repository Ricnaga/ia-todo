import type {
  Todo,
  TodoSuggestion,
  CreateTodoInput,
  UpdateTodoInput,
  DraftInput,
} from '@ia-task-manager/schemas/todo'

export interface ITodoUseCase {
  list(userId: string): Promise<Todo[]>
  getById(id: string, userId: string): Promise<Todo>
  create(input: CreateTodoInput, userId: string): Promise<Todo>
  update(id: string, input: UpdateTodoInput, userId: string): Promise<Todo>
  delete(id: string, userId: string): Promise<void>
  suggestTodo(draft: DraftInput): Promise<TodoSuggestion>
}
