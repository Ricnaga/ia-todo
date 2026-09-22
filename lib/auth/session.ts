import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AuthUser } from '@/lib/schemas/auth'
import { auth } from '@/server/modules/auth/infra/better-auth'

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies()
  const session = await auth.api.getSession({
    headers: new Headers({ cookie: cookieStore.toString() }),
  })
  if (!session) return null
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    image: session.user.image ?? null,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  }
})

export const verifySession = cache(async (): Promise<AuthUser> => {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
})
