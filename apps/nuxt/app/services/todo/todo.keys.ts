/**
 * A invalidacao no Nuxt e match EXATO (`keys.includes(key)`), sem prefixo como
 * no React Query. `writeTargets` e a enumeracao explicita do que cada escrita
 * renova — e o que `refreshNuxtData` recebe na mutation.
 */
export const todoQueryKeys = {
  all: 'TODO_LIST',
  detail: (id: string) => `TODO_DETAIL:${id}`,
  writeTargets: () => [todoQueryKeys.all] as string[],
} as const
