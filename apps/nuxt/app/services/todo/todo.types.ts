import type {
  CreateTodoMutationVariables,
  UpdateTodoMutationVariables,
} from '@ia-task-manager/bff/graphql'

/**
 * Contrato de entrada das mutations de todo, compartilhado entre request e
 * mutation. O `TodoDraft`/`TodoUpdateDraft` de `lib/todo/` nao substitui isto: sao
 * o rascunho da tela, que ainda tem `Date` e campo obrigatorio em branco, e quem
 * converte um no outro sao os `toTodo*Request` da mutation.
 *
 * Deriva do codegen pelo mesmo motivo do `auth.types.ts`: o unico contrato que o
 * servidor aceita e o gerado. Differe do tipo escrito a mao em `completed`, que
 * passou a aceitar `null` -- `updateTodo(id, { completed: null })` e como o
 * servidor distingue "nao mexer no campo" de algo invalido, e o Pothos ja o
 * marca como tal.
 */
export type TodoCreateRequest = CreateTodoMutationVariables['input']
export type TodoUpdateRequest = UpdateTodoMutationVariables['input']
