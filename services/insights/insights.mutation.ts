import { useMutation } from '@tanstack/react-query'
import { summarizeDay } from '@/lib/graphql/client'

export function useSummarizeDay() {
  return useMutation({ mutationFn: summarizeDay })
}
