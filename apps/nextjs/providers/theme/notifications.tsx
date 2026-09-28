'use client'

import { Notifications } from '@mantine/notifications'

/**
 * Unico ponto onde o container de notificacoes e montado. Os defaults (position,
 * autoClose, limit) vivem no tema -- ver `mantine-theme.ts` -- entao aqui nao ha
 * prop nenhuma para duplicar nem para divergir.
 */
export function AppNotifications() {
  return <Notifications />
}
