'use client'

import { Notifications } from '@mantine/notifications'

const NOTIFICATION_POLICY = {
  position: 'top-right',
  autoClose: 5_000,
  limit: 3,
} as const

export function AppNotifications() {
  return <Notifications {...NOTIFICATION_POLICY} />
}
