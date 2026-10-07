<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatDate } from '~/lib/utils/date'
import { useNotifications } from '~/lib/utils/notifications'
import {
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
} from '~/services/auth/auth.mutation'
import { useMySessionsQuery } from '~/services/auth/auth.query'

const sessionDateOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

const { notifyError, notifySuccess } = useNotifications()
const { data: sessions, status, error, execute } = useMySessionsQuery()
const revokeSessionMutation = useRevokeSessionMutation()
const revokeOthersMutation = useRevokeOtherSessionsMutation()

const isPending = computed(() => status.value === 'pending')
const items = computed(() => sessions.value ?? [])
const busySessionId = ref<string | null>(null)

function formatExpiresAt(value: Date): string {
  return formatDate(value, sessionDateOptions)
}

function handleRevokeOthers() {
  revokeOthersMutation.mutate(undefined, {
    onError: notifyError('Não foi possível encerrar as sessões'),
    onSuccess: () => notifySuccess('Sessões encerradas', 'As demais sessões foram revogadas.'),
  })
}

function handleRevoke(sessionId: string) {
  busySessionId.value = sessionId
  revokeSessionMutation.mutate(
    { sessionId },
    {
      onError: (failure) => {
        busySessionId.value = null
        notifyError('Não foi possível encerrar a sessão')(failure)
      },
      onSuccess: () => {
        busySessionId.value = null
        notifySuccess('Sessão encerrada', 'A sessão foi revogada.')
      },
    },
  )
}
</script>

<template>
  <UCard class="max-w-md">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-highlighted font-semibold">Sessões ativas</h2>
        <UButton
          icon="i-tabler:shield-x"
          size="xs"
          color="error"
          variant="soft"
          :loading="revokeOthersMutation.isPending.value"
          @click="handleRevokeOthers"
        >
          Revogar outras sessões
        </UButton>
      </div>

      <ErrorState v-if="error" retry @retry="execute()" />
      <SkeletonSessions v-else-if="isPending" />

      <EmptyState v-else-if="items.length === 0" message="Nenhuma sessão ativa." />

      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="session in items"
          :key="session.id"
          class="flex flex-wrap items-center justify-between gap-2"
        >
          <div class="flex min-w-0 items-center gap-3">
            <UIcon name="i-tabler:device-desktop" class="size-[18px] shrink-0" />
            <div class="min-w-0">
              <p class="max-w-56 text-sm" :class="{ 'line-clamp-1': session.userAgent }">
                {{ session.userAgent || 'Dispositivo desconhecido' }}
              </p>
              <p class="text-dimmed text-xs">
                {{ session.ipAddress || 'IP desconhecido' }} · expira em
                {{ formatExpiresAt(session.expiresAt) }}
              </p>
            </div>
          </div>

          <UBadge :color="session.isCurrent ? 'info' : 'neutral'" variant="soft" size="sm">
            {{ session.isCurrent ? 'Esta sessão' : 'Outro dispositivo' }}
          </UBadge>

          <UButton
            icon="i-tabler:logout"
            size="xs"
            color="error"
            variant="soft"
            :loading="busySessionId === session.id"
            @click="handleRevoke(session.id)"
          >
            Encerrar
          </UButton>
        </li>
      </ul>
    </div>
  </UCard>
</template>
