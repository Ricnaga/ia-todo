import { createMutation } from '$lib/utils/mutation'
import { summarizeDay } from './insights.request'

export function useSummarizeDayMutation() {
  return createMutation({
    mutationFn: () => summarizeDay(),
  })
}
