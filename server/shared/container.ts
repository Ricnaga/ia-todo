import { PrismaTodoRepository } from '@/server/modules/todos/infra/prisma-todo.repository'
import { ListTodosUseCase } from '@/server/modules/todos/use-cases/list-todos.use-case'
import { FindTodoByIdUseCase } from '@/server/modules/todos/use-cases/find-todo-by-id.use-case'
import { CreateTodoUseCase } from '@/server/modules/todos/use-cases/create-todo.use-case'
import { UpdateTodoUseCase } from '@/server/modules/todos/use-cases/update-todo.use-case'
import { DeleteTodoUseCase } from '@/server/modules/todos/use-cases/delete-todo.use-case'
import { SuggestTodoUseCase } from '@/server/modules/todos/use-cases/suggest-todo.use-case'
import { TodoController } from '@/server/modules/todos/controllers/todo.controller'
import { NlSearchUseCase } from '@/server/modules/assistant/use-cases/nl-search.use-case'
import { AssistantController } from '@/server/modules/assistant/controllers/assistant.controller'
import { SummarizeDayUseCase } from '@/server/modules/insights/use-cases/summarize-day.use-case'
import { InsightsController } from '@/server/modules/insights/controllers/insights.controller'
import { GeminiAiService } from '@/server/shared/ai/gemini-ai.service'

const todoRepository = new PrismaTodoRepository()
const aiService = new GeminiAiService()

const listTodos = new ListTodosUseCase(todoRepository)
const findTodoById = new FindTodoByIdUseCase(todoRepository)
const createTodo = new CreateTodoUseCase(todoRepository)
const updateTodo = new UpdateTodoUseCase(todoRepository)
const deleteTodo = new DeleteTodoUseCase(todoRepository)
const suggestTodo = new SuggestTodoUseCase(aiService)

export const todoController = new TodoController({
  list: listTodos,
  findById: findTodoById,
  create: createTodo,
  update: updateTodo,
  delete: deleteTodo,
  suggestTodo,
})

const nlSearch = new NlSearchUseCase(aiService)

export const assistantController = new AssistantController({
  nlSearch,
})

const summarizeDay = new SummarizeDayUseCase(aiService)

export const insightsController = new InsightsController({
  summarizeDay,
})
