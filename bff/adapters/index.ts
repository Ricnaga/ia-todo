import { createTodoAdapter, createAssistantAdapter, createInsightsAdapter } from '@/bff/factories'

export type { TodoPort, TodoCreateInput, TodoUpdateInput, SuggestTodoInput } from './base.adapters'
export type { AssistantPort } from './base.adapters'
export type { InsightsPort } from './base.adapters'

export { todoAdapter, assistantAdapter, insightsAdapter } from './base.adapters'

export const adapters = {
  todo: createTodoAdapter(),
  assistant: createAssistantAdapter(),
  insights: createInsightsAdapter(),
}

export type Adapters = typeof adapters
