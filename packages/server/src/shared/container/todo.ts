import { PrismaTodoRepository } from '../../modules/todos/infra/prisma-todo.repository'
import { CachedTodoRepository } from '../../modules/todos/infra/cached-todo.repository'
import type { ITodoRepository } from '../../modules/todos/repositories/todo-repository.interface'
import { prisma } from '../../db/prisma'
import { cache } from '../cache'
import { ListTodosUseCase } from '../../modules/todos/use-cases/list-todos.use-case'
import { FindTodoByIdUseCase } from '../../modules/todos/use-cases/find-todo-by-id.use-case'
import { CreateTodoUseCase } from '../../modules/todos/use-cases/create-todo.use-case'
import { UpdateTodoUseCase } from '../../modules/todos/use-cases/update-todo.use-case'
import { DeleteTodoUseCase } from '../../modules/todos/use-cases/delete-todo.use-case'
import { SuggestTodoUseCase } from '../../modules/todos/use-cases/suggest-todo.use-case'
import { TodoController } from '../../modules/todos/controllers/todo.controller'
import type { ITodoUseCase } from '../../modules/todos/use-cases/todo.use-case.interface'
import { aiService } from './infra'

const todoRepository: ITodoRepository = new CachedTodoRepository(
  new PrismaTodoRepository(prisma),
  cache,
)

const listTodos = new ListTodosUseCase(todoRepository)
const findTodoById = new FindTodoByIdUseCase(todoRepository)
const createTodo = new CreateTodoUseCase(todoRepository)
const updateTodo = new UpdateTodoUseCase(todoRepository)
const deleteTodo = new DeleteTodoUseCase(todoRepository)
const suggestTodo = new SuggestTodoUseCase(aiService)

const todoUseCase: ITodoUseCase = {
  list: (userId) => listTodos.execute(userId),
  getById: (id, userId) => findTodoById.execute(id, userId),
  create: (input, userId) => createTodo.execute(input, userId),
  update: (id, input, userId) => updateTodo.execute(id, input, userId),
  delete: (id, userId) => deleteTodo.execute(id, userId),
  suggestTodo: (draft) => suggestTodo.execute(draft),
}

export const todoController = new TodoController(todoUseCase)
