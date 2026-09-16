import type { TodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class ListTodosUseCase {
  constructor(private readonly repository: TodoRepository) {}

  async execute(): Promise<Todo[]> {
    return this.repository.list()
  }
}
