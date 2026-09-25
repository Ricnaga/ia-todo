import { updateTodoSchema, type UpdateTodoInput } from '@/lib/schemas/todo'
import type { ITodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class UpdateTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(id: string, input: UpdateTodoInput, userId: string): Promise<Todo> {
    return this.todoRepository.update(id, updateTodoSchema.parse(input), userId)
  }
}
