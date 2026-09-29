import { Skeleton, Stack } from '@mantine/core'

type SkeletonStackProps = {
  lines?: number
  rowHeight?: number
}

/**
 * `role="status"` mora aqui, e nao em cada consumidor, por causa do que ele
 * representa: `role="status"` e uma live region, e o que um esqueleto precisa
 * anunciar e que a regiao esta carregando. Quando o wrapper vivia no
 * `LoadingState`, so as tres telas que usavam aquele componente anunciavam --
 * as outras tres montavam o esqueleto direto e ficavam em silencio para leitor
 * de tela.
 *
 * Acessibilidade e responsabilidade do primitivo: se dependesse de cada call
 * site, o primeiro esqueleto novo nasceria sem o anuncio.
 */
export function SkeletonStack({ lines = 3, rowHeight = 16 }: SkeletonStackProps) {
  return (
    <div role="status" aria-busy="true">
      <Stack gap="sm">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} height={rowHeight} radius="sm" />
        ))}
      </Stack>
    </div>
  )
}
