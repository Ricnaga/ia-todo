import { graphql } from '../generated/gql'

export const ListTodosSource = graphql(`
  query ListTodos {
    todos {
      ...TodoFields
    }
  }
`)

export const GetTodoSource = graphql(`
  query GetTodo($id: String!) {
    todo(id: $id) {
      ...TodoFields
    }
  }
`)

export const CreateTodoSource = graphql(`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      ...TodoFields
    }
  }
`)

export const UpdateTodoSource = graphql(`
  mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      ...TodoFields
    }
  }
`)

export const DeleteTodoSource = graphql(`
  mutation DeleteTodo($id: String!) {
    deleteTodo(id: $id)
  }
`)

export const SuggestTodoSource = graphql(`
  mutation SuggestTodo($draft: DraftInput!) {
    suggestTodo(draft: $draft) {
      ...TodoSuggestionFields
    }
  }
`)
