import { useQuery } from '@tanstack/react-query'
import { summarizeDay } from './insights.request'
import { insightsQueryKeys } from './insights.keys'

export function useDaySummaryQuery() {
  return useQuery({
    queryKey: insightsQueryKeys.daySummary,
    queryFn: summarizeDay,
    enabled: false,
    staleTime: Infinity,
    retry: false,
  })
}
