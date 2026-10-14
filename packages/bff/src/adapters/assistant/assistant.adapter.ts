import type { AssistantController } from '@ia-task-manager/server'
import type { AssistantPort } from './assistant.port'

export function assistantAdapter(controller: AssistantController): AssistantPort {
  return {
    nlSearch: (query, todos, userId) => controller.nlSearch(query, todos, userId),
  }
}
