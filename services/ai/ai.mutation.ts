import { useMutation } from '@tanstack/react-query'
import { nlSearch, suggestTodo, summarizeDay } from '@/lib/graphql/client'

export function useSuggestTodo() {
  return useMutation({ mutationFn: suggestTodo })
}

export function useSummarizeDay() {
  return useMutation({ mutationFn: summarizeDay })
}

export function useNlSearch() {
  return useMutation({ mutationFn: nlSearch })
}
