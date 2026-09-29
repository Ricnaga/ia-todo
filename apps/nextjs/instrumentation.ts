/**
 * `register()` roda uma vez por processo, antes de o servidor atender qualquer
 * request, e e o unico lugar do app que pode montar o cliente do GraphQL.
 *
 * Dois motivos para o import ser dinamico:
 *
 * 1. `services/graphql/base.ts` tambem e importado por componente client, entao
 *    ele nao pode importar o BFF: um import estatico la dentro puxaria o
 *    schema, o better-auth e o Yoga para o bundle do browser. O transporte
 *    entra por injecao, daqui.
 * 2. O Next chama `register` em todos os runtimes, edge inclusive. O BFF depende
 *    do Prisma, que nao roda no edge, entao o import precisa ficar atras do
 *    guard de `NEXT_RUNTIME`: import estatico e compilado para os dois runtimes
 *    mesmo nunca sendo executado no edge.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { setServerGraphQLClient } = await import('@/services/graphql/base')
  const { createServerGraphQLClient } = await import('@/services/graphql/server')

  setServerGraphQLClient(createServerGraphQLClient())
}
