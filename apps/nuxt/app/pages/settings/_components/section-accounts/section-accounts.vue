<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AuthAccount } from '@ia-task-manager/schemas/auth'
import { paths } from '~/lib/constants/paths'
import { useNotifications } from '~/lib/utils/notifications'
import { authClient } from '~/services/auth/auth.client'
import { useUnlinkAccountMutation } from '~/services/auth/auth.mutation'
import { useMyAccountsQuery } from '~/services/auth/auth.query'
import SkeletonAccounts from '../skeleton-accounts/skeleton-accounts.vue'
import ProviderAccountItem from '../provider-account-item/provider-account-item.vue'

const providers = [
  { id: 'google', label: 'Google', icon: 'i-tabler:brand-google' },
  { id: 'github', label: 'GitHub', icon: 'i-tabler:brand-github' },
] as const

type ProviderId = (typeof providers)[number]['id']

const { notifyError, notifySuccess } = useNotifications()
const { data: accounts, status, error, execute } = useMyAccountsQuery()
const unlinkMutation = useUnlinkAccountMutation()

const isPending = computed(() => status.value === 'pending')
const busyAccountId = ref<string | null>(null)

function findAccount(providerId: ProviderId): AuthAccount | undefined {
  return (accounts.value ?? []).find((account) => account.providerId === providerId)
}

async function handleLink(provider: ProviderId) {
  const response = await authClient.linkSocial({ provider, callbackURL: paths.SETTINGS })
  if (response.error) notifyError('Não foi possível vincular a conta')(response.error)
}

function handleUnlink(account: AuthAccount | undefined) {
  if (!account) return
  busyAccountId.value = account.id
  unlinkMutation.mutate(
    { accountId: account.id },
    {
      onError: (failure) => {
        busyAccountId.value = null
        notifyError('Não foi possível desvincular a conta')(failure)
      },
      onSuccess: () => {
        busyAccountId.value = null
        notifySuccess('Conta desvinculada', 'A conta foi removida.')
      },
    },
  )
}
</script>

<template>
  <UCard class="max-w-md">
    <div class="flex flex-col gap-4">
      <h2 class="text-highlighted font-semibold">Contas vinculadas</h2>

      <ErrorState v-if="error" retry @retry="execute()" />
      <SkeletonAccounts v-else-if="isPending" />

      <ul v-else class="flex flex-col gap-3">
        <li v-for="provider in providers" :key="provider.id">
          <ProviderAccountItem
            :label="provider.label"
            :icon="provider.icon"
            :linked="Boolean(findAccount(provider.id))"
            :busy="busyAccountId === findAccount(provider.id)?.id"
            @link="handleLink(provider.id)"
            @unlink="handleUnlink(findAccount(provider.id))"
          />
        </li>
      </ul>
    </div>
  </UCard>
</template>
