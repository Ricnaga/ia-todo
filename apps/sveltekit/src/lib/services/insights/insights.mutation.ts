import { createMutation } from '$lib/utils/mutation.svelte'
import { summarizeDay } from './insights.request'

export function useSummarizeDayMutation() {
  return createMutation({
    mutationFn: () => summarizeDay(),
  })
}
