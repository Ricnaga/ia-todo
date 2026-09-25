import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { paths } from '@/lib/constants/router-paths'

const SESSION_COOKIE = 'better-auth.session_token'

const protectedRoutes = [paths.DASHBOARD, paths.TAREFAS, paths.RESUMO, paths.BUSCA, paths.SETTINGS]

const publicRoutes = [paths.HOME]

function matches(route: string, pathname: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedRoutes.some((route) => matches(route, pathname))
  const isPublic =
    publicRoutes.some((route) => matches(route, pathname)) ||
    pathname === paths.LOGIN ||
    pathname === paths.REGISTER
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = paths.LOGIN
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isPublic && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = paths.DASHBOARD
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
