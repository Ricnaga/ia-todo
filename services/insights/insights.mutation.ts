import { useMutation } from '@tanstack/react-query'
import { summarizeDay } from './insights.request'

export function useSummarizeDayMutation() {
  return useMutation({ mutationFn: summarizeDay })
}
