'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Divider, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useForm, schemaResolver } from '@mantine/form'
import { z } from 'zod'
import { paths } from '@/lib/constants/router-paths'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { authClient } from '@/services/auth'
import {
  OAuthButtons,
  type SocialProvider,
} from '@/app/(public)/_components/oauth-buttons/oauth-buttons'

type FormLoginProps = {
  callbackURL?: string
}

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
})

type FormValues = z.infer<typeof loginSchema>

export function FormLogin({ callbackURL }: FormLoginProps) {
  const router = useRouter()
  const [isSubmitting, startTransition] = useTransition()
  const [isSocialSubmitting, startSocialTransition] = useTransition()
  const form = useForm<FormValues>({
    initialValues: { email: '', password: '' },
    validate: schemaResolver(loginSchema),
  })

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const target = callbackURL || paths.DASHBOARD
        const response = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: target,
        })
        if (response.error) {
          notifyError('Falha ao entrar')(response.error)
          return
        }
        notifySuccess('Login realizado', 'Bem-vindo(a) de volta!')
        router.push(target)
        router.refresh()
      } catch (error) {
        notifyError('Ops, algo deu errado')(error)
      }
    })
  }

  function handleSocial(provider: SocialProvider) {
    startSocialTransition(async () => {
      try {
        const target = callbackURL || paths.DASHBOARD
        const response = await authClient.signIn.social({
          provider,
          callbackURL: target,
        })
        if (response.error) {
          notifyError('Falha na autenticação social')(response.error)
        }
      } catch (error) {
        notifyError('Ops, algo deu errado')(error)
      }
    })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="E-mail"
          placeholder="voce@exemplo.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          required
          {...form.getInputProps('password')}
        />

        <Button type="submit" loading={isSubmitting} fullWidth>
          Entrar
        </Button>

        <Divider label="ou continue com" labelPosition="center" />

        <OAuthButtons loading={isSocialSubmitting} onSocial={handleSocial} />

        <Text size="sm" c="dimmed" ta="center">
          Ainda não tem conta?{' '}
          <Button
            variant="subtle"
            size="compact-sm"
            className="p-0"
            onClick={() => router.push(paths.REGISTER)}
          >
            Crie uma agora
          </Button>
        </Text>
      </Stack>
    </form>
  )
}
