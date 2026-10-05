import { createMutation } from '$lib/utils/mutation'
import { nlSearch } from './assistant.request'

export function useNlSearchMutation() {
  return createMutation({
    mutationFn: (query: string) => nlSearch(query),
  })
}
