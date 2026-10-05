import { graphql } from '../generated/gql'

/**
 * Operacoes de `todo`.
 *
 * `todos` nao aceita filtro no GraphQL -- o filtro e client-side, em
 * `todo-filters.ts`. `suggestTodo` pertence a `todo` (e nao a `assistant`),
 * porque o retorno e um `TodoSuggestion`.
 */

export const ListTodosSource = graphql(/* GraphQL */ `
  query ListTodos {
    todos {
      ...TodoFields
    }
  }
`)

export const GetTodoSource = graphql(/* GraphQL */ `
  query GetTodo($id: String!) {
    todo(id: $id) {
      ...TodoFields
    }
  }
`)

export const CreateTodoSource = graphql(/* GraphQL */ `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      ...TodoFields
    }
  }
`)

export const UpdateTodoSource = graphql(/* GraphQL */ `
  mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      ...TodoFields
    }
  }
`)

export const DeleteTodoSource = graphql(/* GraphQL */ `
  mutation DeleteTodo($id: String!) {
    deleteTodo(id: $id)
  }
`)

export const SuggestTodoSource = graphql(/* GraphQL */ `
  mutation SuggestTodo($draft: DraftInput!) {
    suggestTodo(draft: $draft) {
      ...TodoSuggestionFields
    }
  }
`)
