import { createMutation } from '$lib/utils/mutation.svelte'
import { nlSearch } from './assistant.request'

export function useNlSearchMutation() {
  return createMutation({
    mutationFn: (query: string) => nlSearch(query),
  })
}
