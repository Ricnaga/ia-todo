import { GraphQLRequestError } from '@ia-task-manager/bff/graphql'

export type MutateOptions<TResult> = {
  onSuccess?: (data: TResult) => void | Promise<void>
  onError?: (error: GraphQLRequestError) => void | Promise<void>
}

export type CreateMutationOptions<TInput, TResult> = {
  mutationFn: (input: TInput) => Promise<TResult>
  onSuccess?: (data: TResult, input: TInput) => void | Promise<void>
}

export type Mutation<TInput, TResult> = {
  mutate: (input: TInput, options?: MutateOptions<TResult>) => void
  mutateAsync: (input: TInput, options?: MutateOptions<TResult>) => Promise<TResult>
  readonly isPending: boolean
  readonly error: GraphQLRequestError | null
  readonly data: TResult | null
}

export function createMutation<TInput, TResult>(
  options: CreateMutationOptions<TInput, TResult>,
): Mutation<TInput, TResult> {
  let isPending = $state(false)
  let error = $state<GraphQLRequestError | null>(null)
  let data = $state<TResult | null>(null)

  async function mutateAsync(
    input: TInput,
    mutateOptions: MutateOptions<TResult> = {},
  ): Promise<TResult> {
    isPending = true
    error = null
    try {
      const result = await options.mutationFn(input)
      data = result
      await options.onSuccess?.(result, input)
      await mutateOptions.onSuccess?.(result)
      return result
    } catch (cause) {
      const failure =
        cause instanceof GraphQLRequestError ? cause : new GraphQLRequestError(String(cause))
      error = failure
      await mutateOptions.onError?.(failure)
      throw failure
    } finally {
      isPending = false
    }
  }

  return {
    mutate(input, mutateOptions) {
      void mutateAsync(input, mutateOptions).catch(() => {})
    },
    mutateAsync,
    get isPending() {
      return isPending
    },
    get error() {
      return error
    },
    get data() {
      return data
    },
  }
}
