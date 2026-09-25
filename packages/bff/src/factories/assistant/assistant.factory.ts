import { assistantController } from '@ia-task-manager/server/containers'
import { assistantAdapter } from '../../adapters/base.adapters'

export function createAssistantAdapter() {
  return assistantAdapter(assistantController)
}
