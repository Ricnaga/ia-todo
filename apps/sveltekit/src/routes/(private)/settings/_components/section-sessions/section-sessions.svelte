<script lang="ts">
  import { IconDeviceDesktop, IconLogout, IconShieldX } from '@tabler/icons-svelte'
  import type { AuthSession } from '@ia-task-manager/schemas/auth'
  import EmptyState from '$lib/components/empty-state/empty-state.svelte'
  import {
    useRevokeOtherSessionsMutation,
    useRevokeSessionMutation,
  } from '$lib/services/auth/auth.mutation'
  import { formatDate } from '$lib/utils/date'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'

  const sessionDateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }

  interface Props {
    sessions: AuthSession[]
  }

  let { sessions }: Props = $props()

  const revokeSessionMutation = useRevokeSessionMutation()
  const revokeOthersMutation = useRevokeOtherSessionsMutation()

  let busySessionId = $state<string | null>(null)

  function formatExpiresAt(value: Date): string {
    return formatDate(value, sessionDateOptions)
  }

  function handleRevokeOthers(): void {
    revokeOthersMutation.mutate(undefined, {
      onError: notifyError('Não foi possível encerrar as sessões'),
      onSuccess: () => notifySuccess('Sessões encerradas', 'As demais sessões foram revogadas.'),
    })
  }

  function handleRevoke(sessionId: string): void {
    busySessionId = sessionId
    revokeSessionMutation.mutate(
      { sessionId },
      {
        onError: (failure) => {
          busySessionId = null
          notifyError('Não foi possível encerrar a sessão')(failure)
        },
        onSuccess: () => {
          busySessionId = null
          notifySuccess('Sessão encerrada', 'A sessão foi revogada.')
        },
      },
    )
  }
</script>

<div class="card border-line bg-surface border max-w-md p-6">
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-fg font-semibold">Sessões ativas</h2>
      <button
        type="button"
        class="btn btn-xs preset-tonal-error"
        disabled={revokeOthersMutation.isPending}
        onclick={handleRevokeOthers}
      >
        <IconShieldX class="size-4" />
        Revogar outras sessões
      </button>
    </div>

    {#if sessions.length === 0}
      <EmptyState message="Nenhuma sessão ativa." />
    {:else}
      <ul class="flex flex-col gap-3">
        {#each sessions as session (session.id)}
          <li class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-3">
              <IconDeviceDesktop class="size-[18px] shrink-0" />
              <div class="min-w-0">
                <p class="max-w-56 text-sm" class:line-clamp-1={session.userAgent}>
                  {session.userAgent || 'Dispositivo desconhecido'}
                </p>
                <p class="text-muted text-xs">
                  {session.ipAddress || 'IP desconhecido'} · expira em
                  {formatExpiresAt(session.expiresAt)}
                </p>
              </div>
            </div>

            <span class="badge {session.isCurrent ? 'preset-tonal-primary' : 'preset-tonal'}">
              {session.isCurrent ? 'Esta sessão' : 'Outro dispositivo'}
            </span>

            <button
              type="button"
              class="btn btn-xs preset-tonal-error"
              disabled={busySessionId === session.id}
              onclick={() => handleRevoke(session.id)}
            >
              <IconLogout class="size-4" />
              Encerrar
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
