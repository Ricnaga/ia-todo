import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { paths } from '~/lib/constants/paths'

const SESSION_COOKIE = 'better-auth.session_token'

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.server) return

  const isAuthPage = to.path === paths.LOGIN || to.path === paths.REGISTER
  if (!isAuthPage) return

  const session = useCookie(SESSION_COOKIE)
  if (session.value) return navigateTo(paths.DASHBOARD)
})
