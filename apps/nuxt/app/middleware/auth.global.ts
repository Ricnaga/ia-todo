import { defineNuxtRouteMiddleware, navigateTo, useCookie, useNuxtApp } from '#imports'
import { paths } from '~/lib/constants/paths'
import { useMeQuery } from '~/services/auth/auth.query'

const SESSION_COOKIE = 'better-auth.session_token'

const PROTECTED_ROUTES = [paths.DASHBOARD, paths.TAREFAS, paths.RESUMO, paths.BUSCA, paths.SETTINGS]

function matches(route: string, pathname: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => matches(route, pathname))
}

async function resolveSession(pathname: string): Promise<boolean> {
  if (import.meta.server) return Boolean(useCookie(SESSION_COOKIE).value)

  const nuxtApp = useNuxtApp()
  if (nuxtApp.isHydrating) return isProtectedPath(pathname)

  const { data, error } = await useMeQuery()
  if (error.value) throw error.value

  return Boolean(data.value)
}

export default defineNuxtRouteMiddleware(async (to) => {
  const isProtected = isProtectedPath(to.path)
  const isAuthPage = to.path === paths.LOGIN || to.path === paths.REGISTER

  if (!isProtected && !isAuthPage) return

  const hasSession = await resolveSession(to.path)

  if (isProtected && !hasSession) {
    return navigateTo({ path: paths.LOGIN, query: { next: to.path } })
  }

  if (isAuthPage && hasSession) {
    return navigateTo(paths.DASHBOARD)
  }
})
