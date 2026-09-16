import { useMutation } from '@tanstack/react-query'
import { nlSearch } from '@/lib/graphql/client'

export function useNlSearch() {
  return useMutation({ mutationFn: nlSearch })
}
