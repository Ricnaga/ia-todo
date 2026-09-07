import { aiController, todoController } from '@/server/shared/container'
import type { TodoController } from '@/server/modules/todos/controllers/todo.controller'
import type { AiController } from '@/server/modules/ai/controllers/ai.controller'

export type GraphQLContext = {
  todos: TodoController
  ai: AiController
}

export const createContext = () => (): GraphQLContext => ({
  todos: todoController,
  ai: aiController,
})
