import { TodoNotFoundError } from '@/server/modules/todos/errors'
import type { ITodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class FindTodoByIdUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(id: string): Promise<Todo> {
    const todo = await this.todoRepository.getById(id)
    if (!todo) throw new TodoNotFoundError(id)
    return todo
  }
}
