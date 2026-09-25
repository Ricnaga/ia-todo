import { insightsController } from '@ia-task-manager/server/containers'
import { insightsAdapter } from '../../adapters/base.adapters'

export function createInsightsAdapter() {
  return insightsAdapter(insightsController)
}
