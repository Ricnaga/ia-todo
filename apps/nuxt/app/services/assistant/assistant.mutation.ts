import { useMutation } from '~/composables/useMutation'
import { nlSearch } from './assistant.request'

export function useNlSearchMutation() {
  return useMutation({
    mutationFn: (query: string) => nlSearch(query),
  })
}
