import type { ReactNode } from 'react'
import { verifySession } from '@/lib/auth/session'
import { NavShell } from '@/components/nav-shell'

type AppLayoutProps = {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  await verifySession()
  return <NavShell>{children}</NavShell>
}
