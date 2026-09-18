import type { Todo } from '@/lib/schemas/todo'
import type { CreateTodoOutput, UpdateTodoOutput } from '@/lib/schemas/todo'

export interface ITodoRepository {
  list(): Promise<Todo[]>
  getById(id: string): Promise<Todo | null>
  create(input: CreateTodoOutput): Promise<Todo>
  update(id: string, input: UpdateTodoOutput): Promise<Todo>
  delete(id: string): Promise<void>
}
