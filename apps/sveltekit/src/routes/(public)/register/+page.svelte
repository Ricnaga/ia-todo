<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import { z } from 'zod'
  import CardAuth from '$lib/components/CardAuth.svelte'
  import OAuthButtons from '$lib/components/OAuthButtons.svelte'
  import { paths, type TPath } from '$lib/constants/paths'
  import { authClient } from '$lib/services/auth/auth.client'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'

  const registerSchema = z.object({
    name: z.string().trim().min(2, 'Informe seu nome'),
    email: z.email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'A senha deve ter ao menos 8 caracteres')
      .max(128, 'A senha deve ter no máximo 128 caracteres'),
  })

  const callbackURL = (page.url.searchParams.get('next') || paths.DASHBOARD) as TPath

  let name = $state('')
  let email = $state('')
  let password = $state('')
  let errors = $state<{ name?: string[]; email?: string[]; password?: string[] }>({})
  let isSubmitting = $state(false)
  let isSocialSubmitting = $state(false)

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault()

    const parsed = registerSchema.safeParse({ name, email, password })
    if (!parsed.success) {
      errors = z.flattenError(parsed.error).fieldErrors
      return
    }
    errors = {}

    isSubmitting = true
    try {
      const response = await authClient.signUp.email({
        name: name.trim(),
        email,
        password,
        callbackURL,
      })
      if (response.error) {
        notifyError('Não foi possível criar a conta')(response.error)
        return
      }
      notifySuccess('Conta criada', 'Bem-vindo(a)!')
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

<svelte:head>
  <title>Criar conta | ia-task-manager</title>
</svelte:head>

<CardAuth title="ia-task-manager">
  <form class="flex flex-col gap-4" novalidate onsubmit={handleSubmit}>
    <div class="flex flex-col gap-1">
      <label class="label-text" for="name">Nome</label>
      <input
        id="name"
        name="name"
        type="text"
        class="input"
        placeholder="Como podemos te chamar?"
        autocomplete="name"
        aria-invalid={errors.name ? true : undefined}
        bind:value={name}
      />
      {#if errors.name}
        <span class="text-error text-xs">{errors.name[0]}</span>
      {/if}
    </div>

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
        placeholder="Mínimo de 8 caracteres"
        autocomplete="new-password"
        aria-invalid={errors.password ? true : undefined}
        bind:value={password}
      />
      {#if errors.password}
        <span class="text-error text-xs">{errors.password[0]}</span>
      {/if}
    </div>

    <button type="submit" class="btn preset-filled-primary-500 w-full" disabled={isSubmitting}>
      Criar conta
    </button>

    <div class="relative flex items-center">
      <hr class="hr" />
      <span class="text-muted bg-surface absolute left-1/2 -translate-x-1/2 px-2 text-xs">
        ou crie conta com
      </span>
    </div>

    <OAuthButtons loading={isSocialSubmitting} onsocial={handleSocial} />

    <p class="text-muted text-center text-sm">
      Já tem uma conta?
      <a href={resolve(paths.LOGIN)} class="text-accent font-medium hover:underline">Entrar</a>
    </p>
  </form>
</CardAuth>
