import { useQuery } from '@tanstack/react-query'
import { summarizeDay } from './insights.request'
import { insightsQueryKeys } from './insights.keys'

/**
 * `summarizeDay` roda um LLM, entao nao pode ser disparado em background nem no
 * foco da janela. Fica com `enabled: false` e so busca quando o usuario clica em
 * "Gerar resumo", via `refetch`.
 *
 * `staleTime: Infinity` mantem o resultado em cache para o resto da sessao: sair
 * e voltar da rota nao chama a IA de novo. A invalidacao acontece quando as
 * tarefas mudam (ver `todo.mutation.ts`), que e quando o resumo fica velho de
 * verdade.
 */
export function useDaySummaryQuery() {
  return useQuery({
    queryKey: insightsQueryKeys.daySummary,
    queryFn: summarizeDay,
    enabled: false,
    staleTime: Infinity,
    retry: false,
  })
}
