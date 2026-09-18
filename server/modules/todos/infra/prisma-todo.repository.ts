import { Prisma, type PrismaClient } from '@/server/db/generated/prisma/client'
import { TodoNotFoundError } from '@/server/modules/todos/errors'
import type { ITodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo, TodoSubtask } from '@/lib/schemas/todo'
import type { CreateTodoOutput, UpdateTodoOutput } from '@/lib/schemas/todo'

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

  async list(): Promise<Todo[]> {
    const rows = await this.db.todo.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toDomain)
  }

  async getById(id: string): Promise<Todo | null> {
    const row = await this.db.todo.findUnique({ where: { id } })
    return row ? toDomain(row) : null
  }

  async create(input: CreateTodoOutput): Promise<Todo> {
    const row = await this.db.todo.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        dueDate: input.dueDate ?? null,
      },
    })
    return toDomain(row)
  }

  async update(id: string, input: UpdateTodoOutput): Promise<Todo> {
    const row = await this.db.todo
      .update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
          ...(input.completed !== undefined ? { completed: input.completed } : {}),
        },
      })
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TodoNotFoundError(id)
        }
        throw error
      })
    return toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await this.db.todo.delete({ where: { id } }).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new TodoNotFoundError(id)
      }
      throw error
    })
  }
}
