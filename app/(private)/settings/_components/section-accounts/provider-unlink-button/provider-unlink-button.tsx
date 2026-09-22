import { Button } from '@mantine/core'
import { IconLinkOff } from '@tabler/icons-react'

type ProviderUnlinkButtonProps = {
  busy: boolean
  onClick: () => void
}

export function ProviderUnlinkButton({ busy, onClick }: ProviderUnlinkButtonProps) {
  return (
    <Button
      size="compact-sm"
      variant="light"
      color="red"
      leftSection={<IconLinkOff size={14} />}
      loading={busy}
      onClick={onClick}
    >
      Desvincular
    </Button>
  )
}
