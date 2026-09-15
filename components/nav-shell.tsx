'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppShell, NavLink, Title } from '@mantine/core'
import { IconClipboardList, IconHome, IconSearch, IconSparkles } from '@tabler/icons-react'
import { paths } from '@/lib/constants/router-paths'

const navItems = [
  { href: paths.HOME, label: 'Início', icon: IconHome },
  { href: paths.TAREFAS, label: 'Tarefas', icon: IconClipboardList },
  { href: paths.RESUMO, label: 'Resumo do dia', icon: IconSparkles },
  { href: paths.BUSCA, label: 'Busca por IA', icon: IconSearch },
]

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AppShell
      padding="md"
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
      }}
    >
      <AppShell.Header>
        <div className="flex h-full items-center gap-2 px-4">
          <IconSparkles size={22} />
          <Title order={5}>ia-task-manager</Title>
        </div>
      </AppShell.Header>
      <AppShell.Navbar p="sm">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<Icon size={18} />}
              active={pathname === item.href}
              variant="subtle"
            />
          )
        })}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
