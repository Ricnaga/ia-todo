export const todoQueryKeys = {
  all: ['TODO_LIST'] as const,
  detail: (id: string) => ['TODO_DETAIL', id] as const,
} as const
