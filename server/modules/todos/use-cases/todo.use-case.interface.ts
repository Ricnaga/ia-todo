import type {
  Todo,
  TodoSuggestion,
  CreateTodoInput,
  UpdateTodoInput,
  DraftInput,
} from '@/lib/schemas/todo'

export interface ITodoUseCase {
  list(): Promise<Todo[]>
  getById(id: string): Promise<Todo>
  create(input: CreateTodoInput): Promise<Todo>
  update(id: string, input: UpdateTodoInput): Promise<Todo>
  delete(id: string): Promise<void>
  suggestTodo(draft: DraftInput): Promise<TodoSuggestion>
}
