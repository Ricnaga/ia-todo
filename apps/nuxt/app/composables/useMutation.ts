import { ref, type Ref } from 'vue'
import { GraphQLRequestError } from '~/services/graphql/base'

export type MutateOptions<TResult> = {
  onSuccess?: (data: TResult) => void | Promise<void>
  onError?: (error: GraphQLRequestError) => void | Promise<void>
}

export type UseMutationOptions<TInput, TResult> = {
  mutationFn: (input: TInput) => Promise<TResult>
  onSuccess?: (data: TResult, input: TInput) => void | Promise<void>
}

export type UseMutationReturn<TInput, TResult> = {
  mutate: (input: TInput, options?: MutateOptions<TResult>) => void
  mutateAsync: (input: TInput, options?: MutateOptions<TResult>) => Promise<TResult>
  isPending: Ref<boolean>
  error: Ref<GraphQLRequestError | null>
  data: Ref<TResult | null>
}

export function useMutation<TInput, TResult>(
  options: UseMutationOptions<TInput, TResult>,
): UseMutationReturn<TInput, TResult> {
  const isPending = ref<boolean>(false)
  const error = ref<GraphQLRequestError | null>(null)
  const data = ref<TResult | null>(null) as Ref<TResult | null>

  async function mutateAsync(
    input: TInput,
    mutateOptions: MutateOptions<TResult> = {},
  ): Promise<TResult> {
    isPending.value = true
    error.value = null
    try {
      const result = await options.mutationFn(input)
      data.value = result
      await options.onSuccess?.(result, input)
      await mutateOptions.onSuccess?.(result)
      return result
    } catch (cause) {
      const failure =
        cause instanceof GraphQLRequestError ? cause : new GraphQLRequestError(String(cause))
      error.value = failure
      await mutateOptions.onError?.(failure)
      throw failure
    } finally {
      isPending.value = false
    }
  }

  function mutate(input: TInput, mutateOptions?: MutateOptions<TResult>): void {
    void mutateAsync(input, mutateOptions)
  }

  return { mutate, mutateAsync, isPending, error, data }
}
