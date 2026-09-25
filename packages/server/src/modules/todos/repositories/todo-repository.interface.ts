import type { Todo } from '@ia-task-manager/schemas/todo'
import type { CreateTodoOutput, UpdateTodoOutput } from '@ia-task-manager/schemas/todo'

export interface ITodoRepository {
  list(userId: string): Promise<Todo[]>
  getById(id: string, userId: string): Promise<Todo | null>
  create(input: CreateTodoOutput, userId: string): Promise<Todo>
  update(id: string, input: UpdateTodoOutput, userId: string): Promise<Todo>
  delete(id: string, userId: string): Promise<void>
}
