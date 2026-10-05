export const todoQueryKeys = {
  all: 'app:todos',
  detail: (id: string) => `app:todos:detail:${id}`,
  writeTargets: () => [todoQueryKeys.all] as string[],
} as const
