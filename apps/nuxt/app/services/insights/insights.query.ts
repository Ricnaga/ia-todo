import { useAsyncData } from '#imports'
import { summarizeDay } from './insights.request'
import { insightsQueryKeys } from './insights.keys'

/**
 * `summarizeDay` roda um LLM: nao pode disparar em background nem no foco da
 * janela. Fica com `immediate: false` e `server: false`, e so busca quando o
 * usuario pede o resumo — o mesmo papel de `enabled: false` no React Query.
 */
export function useDaySummaryQuery() {
  return useAsyncData(insightsQueryKeys.daySummary, () => summarizeDay(), {
    server: false,
    immediate: false,
  })
}
