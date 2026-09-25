export const paths = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TAREFAS: '/tarefas',
  RESUMO: '/resumo',
  BUSCA: '/busca',
  SETTINGS: '/settings',
} as const

export type TPath = (typeof paths)[keyof typeof paths]
