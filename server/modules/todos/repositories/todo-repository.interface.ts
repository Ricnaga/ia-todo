import type { Todo, TodoCreate, TodoUpdate } from '@/lib/shared/todos/todo.types'

export interface TodoRepository {
  list(): Promise<Todo[]>
  getById(id: string): Promise<Todo | null>
  create(input: TodoCreate): Promise<Todo>
  update(id: string, input: TodoUpdate): Promise<Todo>
  delete(id: string): Promise<void>
}
