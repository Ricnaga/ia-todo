import { todoController, assistantController, insightsController } from '@/server/shared/container'
import { todoAdapter } from '@/bff/adapters/todo/todo.adapter'
import { assistantAdapter } from '@/bff/adapters/assistant/assistant.adapter'
import { insightsAdapter } from '@/bff/adapters/insights/insights.adapter'
import type { TodoPort } from '@/bff/adapters/todo/todo.port'
import type { AssistantPort } from '@/bff/adapters/assistant/assistant.port'
import type { InsightsPort } from '@/bff/adapters/insights/insights.port'

export type GraphQLContext = {
  adapters: {
    todo: TodoPort
    assistant: AssistantPort
    insights: InsightsPort
  }
}

export const createContext = () => (): GraphQLContext => ({
  adapters: {
    todo: todoAdapter(todoController),
    assistant: assistantAdapter(assistantController),
    insights: insightsAdapter(insightsController),
  },
})
