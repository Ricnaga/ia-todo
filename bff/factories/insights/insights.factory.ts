import { insightsController } from '@/server/shared/container'
import { insightsAdapter } from '@/bff/adapters/base.adapters'

export function createInsightsAdapter() {
  return insightsAdapter(insightsController)
}
