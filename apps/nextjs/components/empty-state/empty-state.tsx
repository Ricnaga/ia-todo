import { Text } from '@mantine/core'

type EmptyStateProps = {
  message: string
}

/**
 * Estado vazio compartilhado pelas telas que precisam dizer "nao ha nada aqui".
 * A prop e `message` e nao `title`/`description` porque nenhuma das telas tem os
 * dois hoje; aceitar os dois agora seria prop nao usada.
 *
 * Mora em `components/` porque busca e resumo tinham uma copia identica cada,
 * uma dentro do proprio route group.
 */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Text size="sm" c="dimmed">
      {message}
    </Text>
  )
}
