import type { Todo } from '@/lib/schemas/todo'
import type { CreateTodoOutput, UpdateTodoOutput } from '@/lib/schemas/todo'

export interface ITodoRepository {
  list(userId: string): Promise<Todo[]>
  getById(id: string, userId: string): Promise<Todo | null>
  create(input: CreateTodoOutput, userId: string): Promise<Todo>
  update(id: string, input: UpdateTodoOutput, userId: string): Promise<Todo>
  delete(id: string, userId: string): Promise<void>
}
