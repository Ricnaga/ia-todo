import {
  createTodoAdapter,
  createAssistantAdapter,
  createInsightsAdapter,
  createAuthAdapter,
} from '../factories'

export type { TodoPort, TodoCreateInput, TodoUpdateInput, SuggestTodoInput } from './base.adapters'
export type { AssistantPort } from './base.adapters'
export type { InsightsPort } from './base.adapters'
export type { AuthPort } from './base.adapters'

export { todoAdapter, assistantAdapter, insightsAdapter, authAdapter } from './base.adapters'

export const adapters = {
  todo: createTodoAdapter(),
  assistant: createAssistantAdapter(),
  insights: createInsightsAdapter(),
  auth: createAuthAdapter(),
}

export type Adapters = typeof adapters
