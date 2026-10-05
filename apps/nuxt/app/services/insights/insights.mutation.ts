import { useMutation } from '~/composables/useMutation'
import { summarizeDay } from './insights.request'

export function useSummarizeDayMutation() {
  return useMutation({
    mutationFn: () => summarizeDay(),
  })
}
