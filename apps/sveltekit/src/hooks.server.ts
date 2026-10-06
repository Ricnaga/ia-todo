import { redirect, type Handle } from '@sveltejs/kit'
import { paths } from '$lib/constants/paths'

const SESSION_COOKIE = 'better-auth.session_token'

export const handle: Handle = ({ event, resolve }) => {
  const { pathname } = event.url
  const isAuthPage = pathname === paths.LOGIN || pathname === paths.REGISTER

  if (isAuthPage && event.cookies.get(SESSION_COOKIE)) {
    redirect(303, paths.DASHBOARD)
  }

  return resolve(event)
}
