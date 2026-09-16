import type { CreateTodoInput, Todo, UpdateTodoInput } from '@/lib/schemas/todo'

export interface TodoRepository {
  list(): Promise<Todo[]>
  getById(id: string): Promise<Todo | null>
  create(input: CreateTodoInput): Promise<Todo>
  update(id: string, input: UpdateTodoInput): Promise<Todo>
  delete(id: string): Promise<void>
}
