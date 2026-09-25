import type { ITodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class ListTodosUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(userId: string): Promise<Todo[]> {
    return this.todoRepository.list(userId)
  }
}
