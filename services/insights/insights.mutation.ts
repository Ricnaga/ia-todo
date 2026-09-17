import { useMutation } from '@tanstack/react-query'
import { summarizeDay } from '@/lib/graphql/client'

export function useSummarizeDayMutation() {
  return useMutation({ mutationFn: summarizeDay })
}
