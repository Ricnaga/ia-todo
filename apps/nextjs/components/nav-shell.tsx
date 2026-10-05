'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell, Avatar, Group, Menu, NavLink, Title } from '@mantine/core'
import {
  IconClipboardList,
  IconHome,
  IconLogout,
  IconSearch,
  IconSettings,
  IconSparkles,
} from '@tabler/icons-react'
import { paths } from '@/lib/constants/router-paths'
import { useSessionGuard } from '@/lib/auth/use-session-guard'
import { authClient, useMeQuery } from '@/services/auth'
import { ThemeSwitcher } from './theme-switcher/theme-switcher'

const navItems = [
  { href: paths.DASHBOARD, label: 'Dashboard', icon: IconHome },
  { href: paths.TAREFAS, label: 'Tarefas', icon: IconClipboardList },
  { href: paths.RESUMO, label: 'Resumo do dia', icon: IconSparkles },
  { href: paths.BUSCA, label: 'Busca por IA', icon: IconSearch },
]

type NavShellProps = {
  children: React.ReactNode
}

export function NavShell({ children }: NavShellProps) {
  // Reage a sessao morrendo depois que o SSR ja aprovou. Fica aqui porque este
  // e o unico componente client da arvore privada, e porque o `handleSignOut`
  // abaixo ja aplica a mesma politica a mao.
  useSessionGuard()

  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: user } = useMeQuery()

  async function handleSignOut() {
    queryClient.clear()
    await authClient.signOut()
    router.push(paths.LOGIN)
    router.refresh()
  }

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
        <div className="flex h-full items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <IconSparkles size={22} />
            <Title order={5}>ia-task-manager</Title>
          </div>
          <Group gap={4}>
            <ThemeSwitcher />
            <Menu position="bottom-end" width={220}>
              <Menu.Target>
                <Avatar
                  src={user?.image ?? undefined}
                  alt={user?.name ?? 'Usuário'}
                  radius="xl"
                  size="sm"
                  className="cursor-pointer"
                />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user?.name ?? 'Minha conta'}</Menu.Label>
                <Menu.Item
                  component={Link}
                  href={paths.SETTINGS}
                  leftSection={<IconSettings size={16} />}
                >
                  Configurações
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} />}
                  onClick={handleSignOut}
                >
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </div>
      </AppShell.Header>
      <AppShell.Navbar p="sm">
        <div className="flex h-full flex-col justify-between">
          <div>
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
          </div>
          <NavLink
            component={Link}
            href={paths.SETTINGS}
            label="Configurações"
            leftSection={<IconSettings size={18} />}
            active={pathname === paths.SETTINGS}
            variant="subtle"
          />
        </div>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
