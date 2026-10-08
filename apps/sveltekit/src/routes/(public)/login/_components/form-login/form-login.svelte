<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { z } from 'zod'
  import OAuthButtons from '../../../_components/oauth-buttons/oauth-buttons.svelte'
  import { paths, type TPath } from '$lib/constants/paths'
  import { authClient } from '$lib/services/auth/auth.client'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'

  const loginSchema = z.object({
    email: z.email('E-mail inválido'),
    password: z.string().min(1, 'Informe sua senha'),
  })

  let { callbackURL = paths.DASHBOARD }: { callbackURL?: TPath } = $props()

  let email = $state('')
  let password = $state('')
  let errors = $state<{ email?: string[]; password?: string[] }>({})
  let isSubmitting = $state(false)
  let isSocialSubmitting = $state(false)

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault()

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      errors = z.flattenError(parsed.error).fieldErrors
      return
    }
    errors = {}

    isSubmitting = true
    try {
      const response = await authClient.signIn.email({ email, password, callbackURL })
      if (response.error) {
        notifyError('Falha ao entrar')(response.error)
        return
      }
      notifySuccess('Login realizado', 'Bem-vindo(a) de volta!')
      await goto(resolve(callbackURL))
    } catch (error) {
      notifyError('Ops, algo deu errado')(error)
    } finally {
      isSubmitting = false
    }
  }

  async function handleSocial(provider: 'google' | 'github'): Promise<void> {
    isSocialSubmitting = true
    try {
      const response = await authClient.signIn.social({ provider, callbackURL })
      if (response.error) {
        notifyError('Falha na autenticação social')(response.error)
      }
    } catch (error) {
      notifyError('Ops, algo deu errado')(error)
    } finally {
      isSocialSubmitting = false
    }
  }
</script>

<form class="flex flex-col gap-4" novalidate onsubmit={handleSubmit}>
  <div class="flex flex-col gap-1">
    <label class="label-text" for="email">E-mail</label>
    <input
      id="email"
      name="email"
      type="email"
      class="input"
      placeholder="voce@exemplo.com"
      autocomplete="email"
      aria-invalid={errors.email ? true : undefined}
      bind:value={email}
    />
    {#if errors.email}
      <span class="text-error text-xs">{errors.email[0]}</span>
    {/if}
  </div>

  <div class="flex flex-col gap-1">
    <label class="label-text" for="password">Senha</label>
    <input
      id="password"
      name="password"
      type="password"
      class="input"
      placeholder="Sua senha"
      autocomplete="current-password"
      aria-invalid={errors.password ? true : undefined}
      bind:value={password}
    />
    {#if errors.password}
      <span class="text-error text-xs">{errors.password[0]}</span>
    {/if}
  </div>

  <button type="submit" class="btn preset-filled-primary-500 w-full" disabled={isSubmitting}>
    Entrar
  </button>

  <div class="relative flex items-center">
    <hr class="hr" />
    <span class="text-muted bg-surface absolute left-1/2 -translate-x-1/2 px-2 text-xs">
      ou continue com
    </span>
  </div>

  <OAuthButtons loading={isSocialSubmitting} onsocial={handleSocial} />

  <p class="text-muted text-center text-sm">
    Ainda não tem conta?
    <a href={resolve(paths.REGISTER)} class="text-accent font-medium hover:underline">
      Crie uma agora
    </a>
  </p>
</form>
