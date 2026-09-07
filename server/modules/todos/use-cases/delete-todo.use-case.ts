import type { TodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'

export class DeleteTodoUseCase {
  constructor(private readonly repository: TodoRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
