import { useAsyncData } from '#imports'
import { summarizeDay } from './insights.request'
import { insightsQueryKeys } from './insights.keys'

export function useDaySummaryQuery() {
  return useAsyncData(insightsQueryKeys.daySummary, () => summarizeDay(), {
    server: false,
    immediate: false,
  })
}
