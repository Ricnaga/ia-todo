import { Button } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'

type ProviderLinkButtonProps = {
  onClick: () => void
}

export function ProviderLinkButton({ onClick }: ProviderLinkButtonProps) {
  return (
    <Button
      size="compact-sm"
      variant="light"
      leftSection={<IconExternalLink size={14} />}
      onClick={onClick}
    >
      Vincular
    </Button>
  )
}
