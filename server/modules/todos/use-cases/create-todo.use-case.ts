import { createTodoSchema } from '@/lib/schemas/todo'
import type { TodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class CreateTodoUseCase {
  constructor(private readonly repository: TodoRepository) {}

  async execute(raw: unknown): Promise<Todo> {
    const input = createTodoSchema.parse(raw)
    return this.repository.create(input)
  }
}
