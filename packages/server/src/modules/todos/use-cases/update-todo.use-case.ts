import { updateTodoSchema, type UpdateTodoInput } from '@ia-task-manager/schemas/todo'
import type { ITodoRepository } from '../repositories/todo-repository.interface'
import type { Todo } from '@ia-task-manager/schemas/todo'

export class UpdateTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(id: string, input: UpdateTodoInput, userId: string): Promise<Todo> {
    return this.todoRepository.update(id, updateTodoSchema.parse(input), userId)
  }
}
