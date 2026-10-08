<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { IconMail } from '@tabler/icons-svelte'
  import { untrack } from 'svelte'
  import type { AuthUser } from '@ia-task-manager/schemas/auth'
  import { z } from 'zod'
  import { paths } from '$lib/constants/paths'
  import { authQueryKeys } from '$lib/services/auth/auth.keys'
  import {
    useChangeEmailMutation,
    useUpdateProfileMutation,
  } from '$lib/services/auth/auth.mutation'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'

  const profileSchema = z.object({
    name: z.string().trim().min(1, 'Informe seu nome'),
    image: z.string().refine((value) => value === '' || /^https?:\/\//.test(value), 'URL inválida'),
  })

  const emailSchema = z.object({
    newEmail: z.email('E-mail inválido'),
  })

  interface Props {
    user: AuthUser
  }

  let { user }: Props = $props()

  const updateProfileMutation = useUpdateProfileMutation()
  const changeEmailMutation = useChangeEmailMutation()

  let profileState = $state({
    name: untrack(() => user.name),
    image: untrack(() => user.image ?? ''),
  })
  let emailState = $state({ newEmail: '' })
  let profileErrors = $state<{ name?: string[]; image?: string[] }>({})
  let emailErrors = $state<{ newEmail?: string[] }>({})

  function handleSubmitProfile(event: SubmitEvent): void {
    event.preventDefault()
    const parsed = profileSchema.safeParse({ name: profileState.name, image: profileState.image })
    if (!parsed.success) {
      profileErrors = z.flattenError(parsed.error).fieldErrors
      return
    }
    profileErrors = {}
    updateProfileMutation.mutate(
      { name: parsed.data.name, image: parsed.data.image || null },
      {
        onError: notifyError('Não foi possível atualizar o perfil'),
        onSuccess: () => {
          notifySuccess('Perfil atualizado', 'Suas informações foram salvas.')
          void invalidate(authQueryKeys.me)
        },
      },
    )
  }

  function handleSubmitEmail(event: SubmitEvent): void {
    event.preventDefault()
    const parsed = emailSchema.safeParse({ newEmail: emailState.newEmail })
    if (!parsed.success) {
      emailErrors = z.flattenError(parsed.error).fieldErrors
      return
    }
    emailErrors = {}
    changeEmailMutation.mutate(
      { newEmail: parsed.data.newEmail, callbackURL: paths.SETTINGS },
      {
        onError: notifyError('Não foi possível alterar o e-mail'),
        onSuccess: () => {
          notifySuccess(
            'E-mail enviado',
            'Confira sua caixa de entrada para confirmar o novo e-mail.',
          )
          emailState.newEmail = ''
        },
      },
    )
  }
</script>

<div class="flex flex-col gap-4">
  <div
    class="animate-in fade-in duration-base ease-entrance card border-line bg-surface border p-6"
  >
    <div class="flex flex-col gap-4">
      <h2 class="text-fg font-semibold">Informações básicas</h2>

      <form class="flex flex-col gap-4" novalidate onsubmit={handleSubmitProfile}>
        <div class="flex flex-col gap-1">
          <label class="label-text" for="profile-name">Nome</label>
          <input
            id="profile-name"
            name="name"
            type="text"
            class="input"
            placeholder="Seu nome"
            bind:value={profileState.name}
          />
          {#if profileErrors.name}
            <span class="text-error text-xs">{profileErrors.name[0]}</span>
          {/if}
        </div>

        <div class="flex flex-col gap-1">
          <label class="label-text" for="profile-image">Foto (URL)</label>
          <input
            id="profile-image"
            name="image"
            type="url"
            class="input"
            placeholder="https://..."
            bind:value={profileState.image}
          />
          <p class="text-muted text-xs">URL pública de uma imagem de perfil</p>
          {#if profileErrors.image}
            <span class="text-error text-xs">{profileErrors.image[0]}</span>
          {/if}
        </div>

        <button
          type="submit"
          class="btn preset-filled-primary-500 self-start"
          disabled={updateProfileMutation.isPending}
        >
          Salvar perfil
        </button>
      </form>
    </div>
  </div>

  <div
    class="animate-in fade-in duration-base ease-entrance card border-line bg-surface border p-6"
  >
    <div class="flex flex-col gap-4">
      <h2 class="text-fg font-semibold">E-mail</h2>

      <div class="flex flex-wrap items-center gap-2">
        <span>{user.email}</span>
        {#if user.emailVerified}
          <span class="badge preset-tonal-success">Verificado</span>
        {:else}
          <span class="badge preset-tonal-warning">Não verificado</span>
        {/if}
      </div>

      <hr class="border-line border-t" />

      <form class="flex flex-col gap-4" novalidate onsubmit={handleSubmitEmail}>
        <div class="flex flex-col gap-1">
          <label class="label-text" for="profile-new-email">Novo e-mail</label>
          <div class="relative">
            <IconMail
              class="text-muted pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
            />
            <input
              id="profile-new-email"
              name="newEmail"
              type="email"
              class="input pl-9"
              placeholder="novo@exemplo.com"
              bind:value={emailState.newEmail}
            />
          </div>
          <p class="text-muted text-xs">Você receberá um link de verificação no novo endereço.</p>
          {#if emailErrors.newEmail}
            <span class="text-error text-xs">{emailErrors.newEmail[0]}</span>
          {/if}
        </div>

        <button
          type="submit"
          class="btn preset-tonal self-start"
          disabled={changeEmailMutation.isPending}
        >
          Alterar e-mail
        </button>
      </form>
    </div>
  </div>
</div>
