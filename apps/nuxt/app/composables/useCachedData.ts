import { useNuxtData } from '#imports'

export function setCachedData<T>(key: string, value: T): void {
  const { data } = useNuxtData<T>(key)
  data.value = value
}
