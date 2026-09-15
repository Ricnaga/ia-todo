export const paths = {
  HOME: '/',
  TAREFAS: '/tarefas',
  RESUMO: '/resumo',
  BUSCA: '/busca',
} as const

export type TPath = (typeof paths)[keyof typeof paths]
