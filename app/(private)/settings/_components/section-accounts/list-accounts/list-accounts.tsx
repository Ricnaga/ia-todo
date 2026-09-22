'use client'

import { List } from '@mantine/core'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import type { AuthAccount } from '@/lib/schemas/auth'
import { paths } from '@/lib/constants/router-paths'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { authClient, useMyAccountsQuery, useUnlinkAccountMutation } from '@/services/auth'
import { ProviderAccountItem } from '../provider-account-item/provider-account-item'

const providers = {
  google: { label: 'Google', icon: IconBrandGoogle },
  github: { label: 'GitHub', icon: IconBrandGithub },
} as const

type ProviderId = keyof typeof providers

const providerList = Object.keys(providers) as ProviderId[]

type AccountRow = {
  provider: ProviderId
  label: string
  icon: Icon
  linked: boolean
  busy: boolean
  account?: AuthAccount
}

export function ListAccounts() {
  const { data: accounts } = useMyAccountsQuery()
  const unlinkAccount = useUnlinkAccountMutation()

  const accountByProvider = new Map(accounts.map((account) => [account.providerId, account]))

  const rows: AccountRow[] = providerList.map((provider) => {
    const { label, icon } = providers[provider]
    const account = accountByProvider.get(provider)
    return {
      provider,
      label,
      icon,
      linked: Boolean(account),
      busy: unlinkAccount.isPending && unlinkAccount.variables?.accountId === account?.id,
      account,
    }
  })

  async function handleLink(provider: ProviderId) {
    const response = await authClient.linkSocial({
      provider,
      callbackURL: paths.SETTINGS,
    })
    if (response.error) {
      notifyError('Não foi possível vincular a conta')(response.error)
    }
  }

  function handleUnlink(account: AuthAccount | undefined) {
    if (!account) return
    unlinkAccount.mutate(
      { accountId: account.id },
      {
        onError: notifyError('Não foi possível desvincular a conta'),
        onSuccess: () => notifySuccess('Conta desvinculada', 'A conta foi removida.'),
      },
    )
  }

  return (
    <List spacing="sm" icon={null}>
      {rows.map((row) => (
        <List.Item key={row.provider}>
          <ProviderAccountItem
            label={row.label}
            icon={row.icon}
            linked={row.linked}
            busy={row.busy}
            onLink={() => handleLink(row.provider)}
            onUnlink={row.account ? () => handleUnlink(row.account) : undefined}
          />
        </List.Item>
      ))}
    </List>
  )
}
