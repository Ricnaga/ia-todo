import { TodoNotFoundError } from '@/server/modules/todos/errors'
import type { TodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/shared/todos/todo.types'

export class FindTodoByIdUseCase {
  constructor(private readonly repository: TodoRepository) {}

  async execute(id: string): Promise<Todo> {
    const todo = await this.repository.getById(id)
    if (!todo) throw new TodoNotFoundError(id)
    return todo
  }
}
