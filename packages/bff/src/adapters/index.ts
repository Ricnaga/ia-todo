import {
  assistantController,
  authController,
  insightsController,
  todoController,
} from '@ia-task-manager/server/containers'
import { todoAdapter, assistantAdapter, insightsAdapter, authAdapter } from './base.adapters'

export type { TodoPort, TodoCreateInput, TodoUpdateInput, SuggestTodoInput } from './base.adapters'
export type { AssistantPort } from './base.adapters'
export type { InsightsPort } from './base.adapters'
export type { AuthPort } from './base.adapters'

export const adapters = {
  todo: todoAdapter(todoController),
  assistant: assistantAdapter(assistantController),
  insights: insightsAdapter(insightsController),
  auth: authAdapter(authController),
}

export type Adapters = typeof adapters
