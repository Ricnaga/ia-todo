import { PrismaTodoRepository } from '@/server/modules/todos/infra/prisma-todo.repository'
import { ListTodosUseCase } from '@/server/modules/todos/use-cases/list-todos.use-case'
import { FindTodoByIdUseCase } from '@/server/modules/todos/use-cases/find-todo-by-id.use-case'
import { CreateTodoUseCase } from '@/server/modules/todos/use-cases/create-todo.use-case'
import { UpdateTodoUseCase } from '@/server/modules/todos/use-cases/update-todo.use-case'
import { DeleteTodoUseCase } from '@/server/modules/todos/use-cases/delete-todo.use-case'
import { TodoController } from '@/server/modules/todos/controllers/todo.controller'
import { AiController } from '@/server/modules/ai/controllers/ai.controller'
import { suggestTodo } from '@/server/modules/ai/capabilities/suggest-todo'
import { summarizeDay } from '@/server/modules/ai/capabilities/summarize-day'
import { nlSearch } from '@/server/modules/ai/capabilities/nl-search'

const todoRepository = new PrismaTodoRepository()

const listTodos = new ListTodosUseCase(todoRepository)
const findTodoById = new FindTodoByIdUseCase(todoRepository)
const createTodo = new CreateTodoUseCase(todoRepository)
const updateTodo = new UpdateTodoUseCase(todoRepository)
const deleteTodo = new DeleteTodoUseCase(todoRepository)

export const todoController = new TodoController({
  list: listTodos,
  findById: findTodoById,
  create: createTodo,
  update: updateTodo,
  delete: deleteTodo,
})

export const aiController = new AiController({ suggestTodo, summarizeDay, nlSearch })
