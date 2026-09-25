import type { ITodoRepository } from '../repositories/todo-repository.interface'
import type { Todo } from '@ia-task-manager/schemas/todo'
import type { CreateTodoOutput, UpdateTodoOutput } from '@ia-task-manager/schemas/todo'
import type { ICache } from '../../../shared/cache/cache.interface'

const DEFAULT_TTL_SECONDS = 300

function todosKey(userId: string): string {
  return `todos:${userId}`
}

export class CachedTodoRepository implements ITodoRepository {
  constructor(
    private readonly repository: ITodoRepository,
    private readonly cache: ICache,
  ) {}

  async list(userId: string): Promise<Todo[]> {
    const cached = await this.cache.get<Todo[]>(todosKey(userId))
    if (cached) return cached
    const todos = await this.repository.list(userId)
    await this.cache.set(todosKey(userId), todos, DEFAULT_TTL_SECONDS)
    return todos
  }

  async getById(id: string, userId: string): Promise<Todo | null> {
    return this.repository.getById(id, userId)
  }

  async create(input: CreateTodoOutput, userId: string): Promise<Todo> {
    const todo = await this.repository.create(input, userId)
    await this.invalidate(userId)
    return todo
  }

  async update(id: string, input: UpdateTodoOutput, userId: string): Promise<Todo> {
    const todo = await this.repository.update(id, input, userId)
    await this.invalidate(userId)
    return todo
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.repository.delete(id, userId)
    await this.invalidate(userId)
  }

  private async invalidate(userId: string): Promise<void> {
    await this.cache.delete(todosKey(userId))
  }
}
