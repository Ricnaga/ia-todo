import { graphql } from '../generated/gql'

export const TodoFieldsSource = graphql(`
  fragment TodoFields on Todo {
    id
    title
    description
    priority
    dueDate
    completed
    createdAt
    updatedAt
    subtasks {
      id
      title
      done
    }
  }
`)

export const TodoSuggestionFieldsSource = graphql(`
  fragment TodoSuggestionFields on TodoSuggestion {
    title
    description
    priority
    subtasks
  }
`)

export const CriteriaFieldsSource = graphql(`
  fragment CriteriaFields on Criteria {
    query
    keywords
    status
    priority
    due
  }
`)

export const DaySummaryFieldsSource = graphql(`
  fragment DaySummaryFields on DaySummary {
    summary
    focus
    suggestedOrder
  }
`)

export const AuthUserFieldsSource = graphql(`
  fragment AuthUserFields on AuthUser {
    id
    name
    email
    emailVerified
    image
    createdAt
    updatedAt
  }
`)

export const AuthAccountFieldsSource = graphql(`
  fragment AuthAccountFields on AuthAccount {
    id
    providerId
    accountId
    userId
    createdAt
    updatedAt
  }
`)

export const AuthSessionFieldsSource = graphql(`
  fragment AuthSessionFields on AuthSession {
    id
    isCurrent
    expiresAt
    ipAddress
    userAgent
    createdAt
    updatedAt
  }
`)
