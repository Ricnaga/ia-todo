export const paths = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const

export type TPath = (typeof paths)[keyof typeof paths]
