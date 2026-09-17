import { useMutation } from '@tanstack/react-query'
import { nlSearch } from '@/lib/graphql/client'

export function useNlSearchMutation() {
  return useMutation({ mutationFn: nlSearch })
}
