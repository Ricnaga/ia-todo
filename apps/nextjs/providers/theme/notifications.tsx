'use client'

import { Notifications } from '@mantine/notifications'

/**
 * Politica do container de notificacoes: canto superior direito, 5s na tela e no
 * maximo 3 ao mesmo tempo.
 *
 * Fica aqui em prop, e nao como default no tema, para que a politica seja
 * legivel no mesmo lugar em que o container e montado. Constante nomeada em vez
 * de numeros magicos soltos no JSX.
 */
const NOTIFICATION_POLICY = {
  position: 'top-right',
  autoClose: 5_000,
  limit: 3,
} as const

export function AppNotifications() {
  return <Notifications {...NOTIFICATION_POLICY} />
}
