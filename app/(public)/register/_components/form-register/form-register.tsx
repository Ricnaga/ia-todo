'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Divider, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useForm, schemaResolver } from '@mantine/form'
import { z } from 'zod'
import { paths } from '@/lib/constants/router-paths'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { authClient } from '@/services/auth'
import { OAuthButtons, type SocialProvider } from '../../../_components/oauth-buttons/oauth-buttons'

type FormRegisterProps = {
  callbackURL?: string
}

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres')
    .max(128, 'A senha deve ter no máximo 128 caracteres'),
})

type FormValues = z.infer<typeof registerSchema>

export function FormRegister({ callbackURL }: FormRegisterProps) {
  const router = useRouter()
  const [isSubmitting, startTransition] = useTransition()
  const [isSocialSubmitting, startSocialTransition] = useTransition()
  const form = useForm<FormValues>({
    initialValues: { name: '', email: '', password: '' },
    validate: schemaResolver(registerSchema),
  })

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const target = callbackURL || paths.DASHBOARD
        const response = await authClient.signUp.email({
          name: values.name.trim(),
          email: values.email,
          password: values.password,
          callbackURL: target,
        })
        if (response.error) {
          notifyError('Não foi possível criar a conta')(response.error)
          return
        }
        notifySuccess('Conta criada', 'Bem-vindo(a)!')
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
          label="Nome"
          placeholder="Como podemos te chamar?"
          required
          {...form.getInputProps('name')}
        />
        <TextInput
          label="E-mail"
          placeholder="voce@exemplo.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Senha"
          placeholder="Mínimo de 8 caracteres"
          required
          {...form.getInputProps('password')}
        />

        <Button type="submit" loading={isSubmitting} fullWidth>
          Criar conta
        </Button>

        <Divider label="ou crie conta com" labelPosition="center" />

        <OAuthButtons loading={isSocialSubmitting} onSocial={handleSocial} />

        <Text size="sm" c="dimmed" ta="center">
          Já tem uma conta?{' '}
          <Button
            variant="subtle"
            size="compact-sm"
            className="p-0"
            onClick={() => router.push(paths.LOGIN)}
          >
            Entrar
          </Button>
        </Text>
      </Stack>
    </form>
  )
}
