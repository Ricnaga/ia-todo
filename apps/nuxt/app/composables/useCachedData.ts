import { useNuxtData } from '#imports'

/**
 * Equivalente ao `setQueryData` do React Query: escreve no cache sem refetch.
 * Usado quando a mutation ja devolve o valor novo e a query pode ser
 * atualizada na hora (ver `useUpdateProfileMutation`). Para o resto, o certo e
 * `refreshNuxtData`.
 */
export function setCachedData<T>(key: string, value: T): void {
  const { data } = useNuxtData<T>(key)
  data.value = value
}
