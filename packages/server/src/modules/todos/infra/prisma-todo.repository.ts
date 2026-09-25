import { Prisma, type PrismaClient } from '../../../db/generated/prisma/client'
import { TodoNotFoundError } from '../../../shared/errors/app.errors'
import type { ITodoRepository } from '../repositories/todo-repository.interface'
import type { Todo, TodoSubtask } from '@ia-task-manager/schemas/todo'
import type { CreateTodoOutput, UpdateTodoOutput } from '@ia-task-manager/schemas/todo'

type TodoRow = Prisma.TodoGetPayload<object>

function toDomain(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority as Todo['priority'],
    dueDate: row.dueDate,
    subtasks: (row.subtasks as TodoSubtask[] | null) ?? null,
    completed: row.completed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class PrismaTodoRepository implements ITodoRepository {
  constructor(private readonly db: PrismaClient) {}

  async list(userId: string): Promise<Todo[]> {
    const rows = await this.db.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toDomain)
  }

  async getById(id: string, userId: string): Promise<Todo | null> {
    const row = await this.db.todo.findFirst({ where: { id, userId } })
    return row ? toDomain(row) : null
  }

  async create(input: CreateTodoOutput, userId: string): Promise<Todo> {
    const row = await this.db.todo.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        dueDate: input.dueDate ?? null,
        userId,
      },
    })
    return toDomain(row)
  }

  async update(id: string, input: UpdateTodoOutput, userId: string): Promise<Todo> {
    const result = await this.db.todo.updateMany({
      where: { id, userId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
        ...(input.completed !== undefined ? { completed: input.completed } : {}),
      },
    })
    if (result.count === 0) throw new TodoNotFoundError(id)
    const row = await this.db.todo.findUniqueOrThrow({ where: { id } })
    return toDomain(row)
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.db.todo.deleteMany({ where: { id, userId } })
    if (result.count === 0) throw new TodoNotFoundError(id)
  }
}
