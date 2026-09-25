'use client'

import { Tabs, Title } from '@mantine/core'
import { IconFingerprint, IconLink, IconUserCircle, IconWorld } from '@tabler/icons-react'
import type { AuthUser } from '@/lib/schemas/auth'
import { SectionProfile } from './section-profile/section-profile'
import { SectionSecurity } from './section-security/section-security'
import { SectionAccounts } from './section-accounts/section-accounts'
import { SectionSessions } from './section-sessions/section-sessions'

type SettingsPanelProps = {
  user: AuthUser
}

export function SettingsPanel({ user }: SettingsPanelProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-6">
      <Title order={1}>Configurações</Title>
      <Tabs defaultValue="profile" orientation="vertical">
        <Tabs.List>
          <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>
            Perfil
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconFingerprint size={16} />}>
            Segurança
          </Tabs.Tab>
          <Tabs.Tab value="accounts" leftSection={<IconLink size={16} />}>
            Contas vinculadas
          </Tabs.Tab>
          <Tabs.Tab value="sessions" leftSection={<IconWorld size={16} />}>
            Sessões ativas
          </Tabs.Tab>
        </Tabs.List>

        <div className="min-w-0 flex-1">
          <Tabs.Panel value="profile" p="md">
            <SectionProfile user={user} />
          </Tabs.Panel>
          <Tabs.Panel value="security" p="md">
            <SectionSecurity />
          </Tabs.Panel>
          <Tabs.Panel value="accounts" p="md">
            <SectionAccounts />
          </Tabs.Panel>
          <Tabs.Panel value="sessions" p="md">
            <SectionSessions />
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  )
}
