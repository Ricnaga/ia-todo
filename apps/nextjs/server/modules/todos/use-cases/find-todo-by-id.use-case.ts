import { TodoNotFoundError } from '@/server/shared/errors/app.errors'
import type { ITodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class FindTodoByIdUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.getById(id, userId)
    if (!todo) throw new TodoNotFoundError(id)
    return todo
  }
}
