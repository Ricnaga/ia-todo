import { Button } from '@mantine/core'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'

export type SocialProvider = 'google' | 'github'

type OAuthButtonsProps = {
  loading?: boolean
  onSocial: (provider: SocialProvider) => void
}

export function OAuthButtons({ loading, onSocial }: OAuthButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="light"
        fullWidth
        leftSection={<IconBrandGoogle size={16} />}
        loading={loading}
        onClick={() => onSocial('google')}
      >
        Google
      </Button>
      <Button
        variant="light"
        fullWidth
        leftSection={<IconBrandGithub size={16} />}
        loading={loading}
        onClick={() => onSocial('github')}
      >
        GitHub
      </Button>
    </div>
  )
}
