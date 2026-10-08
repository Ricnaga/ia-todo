<script lang="ts">
  import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-svelte'
  import type { AuthAccount } from '@ia-task-manager/schemas/auth'
  import { paths } from '$lib/constants/paths'
  import { authClient } from '$lib/services/auth/auth.client'
  import { useUnlinkAccountMutation } from '$lib/services/auth/auth.mutation'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'
  import ProviderAccountItem from '../provider-account-item/provider-account-item.svelte'

  const providers = [
    { id: 'google', label: 'Google', icon: IconBrandGoogle },
    { id: 'github', label: 'GitHub', icon: IconBrandGithub },
  ] as const

  type ProviderId = (typeof providers)[number]['id']

  interface Props {
    accounts: AuthAccount[]
  }

  let { accounts }: Props = $props()

  const unlinkMutation = useUnlinkAccountMutation()

  let busyAccountId = $state<string | null>(null)

  function findAccount(providerId: ProviderId): AuthAccount | undefined {
    return accounts.find((account) => account.providerId === providerId)
  }

  async function handleLink(providerId: ProviderId): Promise<void> {
    const response = await authClient.linkSocial({
      provider: providerId,
      callbackURL: paths.SETTINGS,
    })
    if (response.error) notifyError('Não foi possível vincular a conta')(response.error)
  }

  function handleUnlink(account: AuthAccount | undefined): void {
    if (!account) return
    busyAccountId = account.id
    unlinkMutation.mutate(
      { accountId: account.id },
      {
        onError: (failure) => {
          busyAccountId = null
          notifyError('Não foi possível desvincular a conta')(failure)
        },
        onSuccess: () => {
          busyAccountId = null
          notifySuccess('Conta desvinculada', 'A conta foi removida.')
        },
      },
    )
  }
</script>

<div
  class="animate-in fade-in duration-base ease-entrance card border-line bg-surface border max-w-md p-6"
>
  <div class="flex flex-col gap-4">
    <h2 class="text-fg font-semibold">Contas vinculadas</h2>

    <ul class="flex flex-col gap-3">
      {#each providers as provider (provider.id)}
        <li>
          <ProviderAccountItem
            label={provider.label}
            icon={provider.icon}
            linked={Boolean(findAccount(provider.id))}
            busy={busyAccountId === findAccount(provider.id)?.id}
            onlink={() => handleLink(provider.id)}
            onunlink={() => handleUnlink(findAccount(provider.id))}
          />
        </li>
      {/each}
    </ul>
  </div>
</div>
