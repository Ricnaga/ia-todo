import type { ITodoRepository } from '../repositories/todo-repository.interface'

export class DeleteTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.todoRepository.delete(id, userId)
  }
}
