import { redirect, type Handle } from '@sveltejs/kit'
import { paths } from '$lib/constants/paths'

const SESSION_COOKIE = 'better-auth.session_token'

const PROTECTED_ROUTES = [paths.DASHBOARD, paths.TAREFAS, paths.RESUMO, paths.BUSCA, paths.SETTINGS]

function matches(route: string, pathname: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export const handle: Handle = ({ event, resolve }) => {
  const { pathname } = event.url
  const hasSession = Boolean(event.cookies.get(SESSION_COOKIE))
  const isProtected = PROTECTED_ROUTES.some((route) => matches(route, pathname))
  const isAuthPage = pathname === paths.LOGIN || pathname === paths.REGISTER

  if (isProtected && !hasSession) {
    redirect(303, `${paths.LOGIN}?next=${encodeURIComponent(pathname)}`)
  }

  if (isAuthPage && hasSession) {
    redirect(303, paths.DASHBOARD)
  }

  return resolve(event)
}
