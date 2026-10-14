export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED'

export const PRO_REQUIRED_CODE = 'PRO_REQUIRED'

export class GraphQLRequestError extends Error {
  readonly code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'GraphQLRequestError'
    this.code = code
  }
}
