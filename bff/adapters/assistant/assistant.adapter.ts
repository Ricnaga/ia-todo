import type { AssistantController } from '@/server/modules/assistant/controllers/assistant.controller'
import type { AssistantPort } from './assistant.port'

export function assistantAdapter(controller: AssistantController): AssistantPort {
  return {
    nlSearch: (query, todos) => controller.nlSearch(query, todos),
  }
}
