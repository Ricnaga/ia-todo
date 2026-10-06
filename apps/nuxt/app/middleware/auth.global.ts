import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { paths } from '~/lib/constants/paths'

const SESSION_COOKIE = 'better-auth.session_token'

const PROTECTED_ROUTES = [paths.DASHBOARD, paths.TAREFAS, paths.RESUMO, paths.BUSCA, paths.SETTINGS]

function matches(route: string, pathname: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export default defineNuxtRouteMiddleware((to) => {
  const hasSession = Boolean(useCookie(SESSION_COOKIE).value)
  const isProtected = PROTECTED_ROUTES.some((route) => matches(route, to.path))
  const isAuthPage = to.path === paths.LOGIN || to.path === paths.REGISTER

  if (isProtected && !hasSession) {
    return navigateTo({ path: paths.LOGIN, query: { next: to.path } })
  }

  if (isAuthPage && hasSession) {
    return navigateTo(paths.DASHBOARD)
  }
})
