import { useMutation } from '@tanstack/react-query'
import { nlSearch } from './assistant.request'

export function useNlSearchMutation() {
  return useMutation({ mutationFn: nlSearch })
}
