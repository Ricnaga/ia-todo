import { assistantController } from '@/server/shared/container'
import { assistantAdapter } from '@/bff/adapters/base.adapters'

export function createAssistantAdapter() {
  return assistantAdapter(assistantController)
}
