export const todoQueryKeys = {
  all: 'TODO_LIST',
  detail: (id: string) => `TODO_DETAIL:${id}`,
  writeTargets: () => [todoQueryKeys.all] as string[],
} as const
