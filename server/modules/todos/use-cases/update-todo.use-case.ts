import { updateTodoSchema } from '@/lib/schemas/todo'
import type { TodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class UpdateTodoUseCase {
  constructor(private readonly repository: TodoRepository) {}

  async execute(id: string, raw: unknown): Promise<Todo> {
    const input = updateTodoSchema.parse(raw)
    return this.repository.update(id, input)
  }
}
