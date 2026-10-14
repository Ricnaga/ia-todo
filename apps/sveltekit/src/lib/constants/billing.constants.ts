import type { BillingInterval } from '@ia-task-manager/schemas/billing'

export const FREE_FEATURES = [
  'Tarefas ilimitadas — criar, editar e concluir',
  'Prioridades, datas e subtarefas',
  'Filtros e organização',
] as const

export const PRO_FEATURES = [
  'Tudo do plano Free',
  'Sugestão de tarefa com IA',
  'Resumo do dia com IA',
  'Busca em linguagem natural com IA',
] as const

export const PRO_PRICES: Record<BillingInterval, string> = {
  monthly: 'R$ 19,90',
  yearly: 'R$ 199,00',
}

export const PRO_INTERVAL_CAPTIONS: Record<BillingInterval, string> = {
  monthly: 'por mês',
  yearly: 'por ano',
}
