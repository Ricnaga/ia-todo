'use client'

import { Button, Card, PasswordInput, Stack, Title } from '@mantine/core'
import { useForm, schemaResolver } from '@mantine/form'
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/schemas/auth'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { useChangePasswordMutation } from '@/services/auth'

export function SectionSecurity() {
  const changePassword = useChangePasswordMutation()
  const form = useForm<ChangePasswordInput>({
    initialValues: { currentPassword: '', newPassword: '' },
    validate: schemaResolver(changePasswordSchema),
  })

  function handleSubmit(values: ChangePasswordInput) {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onError: notifyError('Não foi possível alterar a senha'),
        onSuccess: () => {
          notifySuccess('Senha alterada', 'Sua senha foi atualizada com sucesso.')
          form.reset()
        },
      },
    )
  }

  return (
    <Card withBorder shadow="sm" padding="lg" className="max-w-md">
      <Title order={4} mb="sm">
        Alterar senha
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <PasswordInput
            label="Senha atual"
            placeholder="Sua senha atual"
            {...form.getInputProps('currentPassword')}
          />
          <PasswordInput
            label="Nova senha"
            placeholder="Mínimo de 8 caracteres"
            {...form.getInputProps('newPassword')}
          />
          <Button type="submit" loading={changePassword.isPending} className="self-start">
            Alterar senha
          </Button>
        </Stack>
      </form>
    </Card>
  )
}
