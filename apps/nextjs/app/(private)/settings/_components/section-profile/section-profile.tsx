'use client'

import { Badge, Button, Card, Divider, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconMail } from '@tabler/icons-react'
import type { AuthUser } from '@ia-task-manager/schemas/auth'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { useUpdateProfileMutation, useChangeEmailMutation } from '@/services/auth'

type SectionProfileProps = {
  user: AuthUser
}

type ProfileValues = {
  name: string
  image: string
}

type EmailValues = {
  newEmail: string
}

export function SectionProfile({ user }: SectionProfileProps) {
  const updateProfile = useUpdateProfileMutation()
  const changeEmail = useChangeEmailMutation()

  const profileForm = useForm<ProfileValues>({
    initialValues: { name: user.name, image: user.image ?? '' },
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Informe seu nome' : null),
      image: (value) => (value && !/^https?:\/\//.test(value) ? 'URL inválida' : null),
    },
  })

  const emailForm = useForm<EmailValues>({
    initialValues: { newEmail: '' },
    validate: {
      newEmail: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'E-mail inválido'),
    },
  })

  function handleProfile(values: ProfileValues) {
    updateProfile.mutate(
      { name: values.name.trim(), image: values.image || null },
      {
        onError: notifyError('Não foi possível atualizar o perfil'),
        onSuccess: () => notifySuccess('Perfil atualizado', 'Suas informações foram salvas.'),
      },
    )
  }

  function handleEmail(values: EmailValues) {
    changeEmail.mutate(
      { newEmail: values.newEmail, callbackURL: '/settings' },
      {
        onError: notifyError('Não foi possível alterar o e-mail'),
        onSuccess: () => {
          notifySuccess(
            'E-mail enviado',
            'Confira sua caixa de entrada para confirmar o novo e-mail.',
          )
          emailForm.reset()
        },
      },
    )
  }

  return (
    <Stack gap="lg">
      <Card withBorder shadow="sm" padding="lg">
        <Title order={4} mb="sm">
          Informações básicas
        </Title>
        <form onSubmit={profileForm.onSubmit(handleProfile)}>
          <Stack gap="md">
            <TextInput label="Nome" placeholder="Seu nome" {...profileForm.getInputProps('name')} />
            <TextInput
              label="Foto (URL)"
              placeholder="https://..."
              description="URL pública de uma imagem de perfil"
              {...profileForm.getInputProps('image')}
            />
            <Button type="submit" loading={updateProfile.isPending} className="self-start">
              Salvar perfil
            </Button>
          </Stack>
        </form>
      </Card>

      <Card withBorder shadow="sm" padding="lg">
        <Title order={4} mb="xs">
          E-mail
        </Title>
        <div className="mb-2 flex items-center gap-2">
          <Text>{user.email}</Text>
          <Badge
            size="sm"
            variant={user.emailVerified ? 'light' : 'outline'}
            color={user.emailVerified ? 'green' : 'yellow'}
          >
            {user.emailVerified ? 'Verificado' : 'Não verificado'}
          </Badge>
        </div>
        <Divider mb="md" />
        <form onSubmit={emailForm.onSubmit(handleEmail)}>
          <Stack gap="md">
            <TextInput
              label="Novo e-mail"
              placeholder="novo@exemplo.com"
              description="Você receberá um link de verificação no novo endereço."
              leftSection={<IconMail size={16} />}
              {...emailForm.getInputProps('newEmail')}
            />
            <Button
              type="submit"
              variant="light"
              loading={changeEmail.isPending}
              className="self-start"
            >
              Alterar e-mail
            </Button>
          </Stack>
        </form>
      </Card>
    </Stack>
  )
}
