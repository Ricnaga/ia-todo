export const paths = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TAREFAS: '/tarefas',
  RESUMO: '/resumo',
  BUSCA: '/busca',
  SETTINGS: '/settings',
  PLANOS: '/planos',
} as const

export type TPath = (typeof paths)[keyof typeof paths]
