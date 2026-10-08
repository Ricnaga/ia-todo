<script lang="ts">
  import { changePasswordSchema } from '@ia-task-manager/schemas/auth'
  import type { ChangePasswordInput } from '@ia-task-manager/schemas/auth'
  import { z } from 'zod'
  import { useChangePasswordMutation } from '$lib/services/auth/auth.mutation'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'

  const changePasswordMutation = useChangePasswordMutation()

  let passwordState: ChangePasswordInput = $state({ currentPassword: '', newPassword: '' })
  let errors = $state<{ currentPassword?: string[]; newPassword?: string[] }>({})

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault()
    const parsed = changePasswordSchema.safeParse({
      currentPassword: passwordState.currentPassword,
      newPassword: passwordState.newPassword,
    })
    if (!parsed.success) {
      errors = z.flattenError(parsed.error).fieldErrors
      return
    }
    errors = {}
    changePasswordMutation.mutate(
      { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword },
      {
        onError: notifyError('Não foi possível alterar a senha'),
        onSuccess: () => {
          notifySuccess('Senha alterada', 'Sua senha foi atualizada com sucesso.')
          passwordState.currentPassword = ''
          passwordState.newPassword = ''
        },
      },
    )
  }
</script>

<div class="card border-line bg-surface border max-w-md p-6">
  <div class="flex flex-col gap-4">
    <h2 class="text-fg font-semibold">Alterar senha</h2>

    <form class="flex flex-col gap-4" novalidate onsubmit={handleSubmit}>
      <div class="flex flex-col gap-1">
        <label class="label-text" for="security-current-password">Senha atual</label>
        <input
          id="security-current-password"
          name="currentPassword"
          type="password"
          class="input"
          placeholder="Sua senha atual"
          bind:value={passwordState.currentPassword}
        />
        {#if errors.currentPassword}
          <span class="text-error text-xs">{errors.currentPassword[0]}</span>
        {/if}
      </div>

      <div class="flex flex-col gap-1">
        <label class="label-text" for="security-new-password">Nova senha</label>
        <input
          id="security-new-password"
          name="newPassword"
          type="password"
          class="input"
          placeholder="Mínimo de 8 caracteres"
          bind:value={passwordState.newPassword}
        />
        {#if errors.newPassword}
          <span class="text-error text-xs">{errors.newPassword[0]}</span>
        {/if}
      </div>

      <button
        type="submit"
        class="btn preset-filled-primary-500 self-start"
        disabled={changePasswordMutation.isPending}
      >
        Alterar senha
      </button>
    </form>
  </div>
</div>
