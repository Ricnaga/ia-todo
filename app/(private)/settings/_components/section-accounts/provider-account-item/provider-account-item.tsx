import { Badge, Group, Text } from '@mantine/core'
import type { Icon } from '@tabler/icons-react'
import { ProviderLinkButton } from '../provider-link-button/provider-link-button'
import { ProviderUnlinkButton } from '../provider-unlink-button/provider-unlink-button'

type ProviderAccountItemProps = {
  label: string
  icon: Icon
  linked: boolean
  busy: boolean
  onLink: () => void
  onUnlink?: () => void
}

export function ProviderAccountItem({
  label,
  icon: Icon,
  linked,
  busy,
  onLink,
  onUnlink,
}: ProviderAccountItemProps) {
  const badge = linked ? (
    <Badge size="sm" variant="light" color="green">
      Vinculada
    </Badge>
  ) : (
    <Badge size="sm" variant="outline" color="gray">
      Não vinculada
    </Badge>
  )

  const action = linked ? (
    <ProviderUnlinkButton busy={busy} onClick={() => onUnlink?.()} />
  ) : (
    <ProviderLinkButton onClick={onLink} />
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <Group gap="sm">
        <Icon size={18} />
        <Text>{label}</Text>
        {badge}
      </Group>
      {action}
    </div>
  )
}
