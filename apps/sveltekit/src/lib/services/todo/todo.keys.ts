/**
 * No SvelteKit nao existe "query key": o cache e a propria load, e o que se
 * invalida sao as dependencias declaradas em `depends('app:todos')`. Por isso a
 * chave e uma tag com prefixo `app:` e `writeTargets` e a enumeracao explicita
 * do que cada escrita renova.
 */
export const todoQueryKeys = {
  all: 'app:todos',
  detail: (id: string) => `app:todos:detail:${id}`,
  writeTargets: () => [todoQueryKeys.all] as string[],
} as const
