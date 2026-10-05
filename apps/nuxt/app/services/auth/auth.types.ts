import type {
  ChangeEmailMutationVariables,
  ChangePasswordMutationVariables,
  RevokeSessionMutationVariables,
  UnlinkAccountMutationVariables,
  UpdateProfileMutationVariables,
} from '@ia-task-manager/bff/graphql'

/**
 * Contrato de entrada das mutations de sessao, em um arquivo so porque request e
 * mutation sao os dois leitores dele. A mutation redeclarava o shape inline -- e o
 * `useMutation<T, Error, V>` do React Query ainda ocupava uma terceira copia --
 * que so quebrava quando o request era compilado, nunca quando o form mudava.
 *
 * Sai do codegen em vez de ser escrito a mao: o tipo gerado e a unica fonte que
 * o servidor aceita, entao deriva-lo torna impossivel o tipo do cliente divergir
 * do schema. E preciso porque o nome gerado ja e `UpdateProfileInput`, com
 * `name?: string | null` -- `null` limpa o campo. O tipo antigo escrito a mao
 * era `name?: string` e recusava o `null`; mesmo nome, contrato diferente.
 *
 * O sufixo `Request` tambem evita a colisao com o `*Input` gerado, que e o tipo
 * do schema e nao o parametro da mutation.
 */
export type UpdateProfileRequest = UpdateProfileMutationVariables['input']
export type ChangeEmailRequest = ChangeEmailMutationVariables['input']
export type ChangePasswordRequest = ChangePasswordMutationVariables['input']
export type UnlinkAccountRequest = UnlinkAccountMutationVariables['input']
export type RevokeSessionRequest = RevokeSessionMutationVariables['input']
