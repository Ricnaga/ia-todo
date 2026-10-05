/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation NlSearch($query: String!) {\n    nlSearch(query: $query) {\n      criteria {\n        ...CriteriaFields\n      }\n      todos {\n        ...TodoFields\n      }\n    }\n  }\n": typeof types.NlSearchDocument,
    "\n  query Me {\n    me {\n      ...AuthUserFields\n    }\n  }\n": typeof types.MeDocument,
    "\n  query MyAccounts {\n    myAccounts {\n      ...AuthAccountFields\n    }\n  }\n": typeof types.MyAccountsDocument,
    "\n  query MySessions {\n    mySessions {\n      ...AuthSessionFields\n    }\n  }\n": typeof types.MySessionsDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...AuthUserFields\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation ChangeEmail($input: ChangeEmailInput!) {\n    changeEmail(input: $input)\n  }\n": typeof types.ChangeEmailDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n": typeof types.ChangePasswordDocument,
    "\n  mutation UnlinkAccount($input: UnlinkAccountInput!) {\n    unlinkAccount(input: $input)\n  }\n": typeof types.UnlinkAccountDocument,
    "\n  mutation RevokeSession($input: RevokeSessionInput!) {\n    revokeSession(input: $input)\n  }\n": typeof types.RevokeSessionDocument,
    "\n  mutation RevokeOtherSessions {\n    revokeOtherSessions\n  }\n": typeof types.RevokeOtherSessionsDocument,
    "\n  fragment TodoFields on Todo {\n    id\n    title\n    description\n    priority\n    dueDate\n    completed\n    createdAt\n    updatedAt\n    subtasks {\n      id\n      title\n      done\n    }\n  }\n": typeof types.TodoFieldsFragmentDoc,
    "\n  fragment TodoSuggestionFields on TodoSuggestion {\n    title\n    description\n    priority\n    subtasks\n  }\n": typeof types.TodoSuggestionFieldsFragmentDoc,
    "\n  fragment CriteriaFields on Criteria {\n    query\n    keywords\n    status\n    priority\n    due\n  }\n": typeof types.CriteriaFieldsFragmentDoc,
    "\n  fragment DaySummaryFields on DaySummary {\n    summary\n    focus\n    suggestedOrder\n  }\n": typeof types.DaySummaryFieldsFragmentDoc,
    "\n  fragment AuthUserFields on AuthUser {\n    id\n    name\n    email\n    emailVerified\n    image\n    createdAt\n    updatedAt\n  }\n": typeof types.AuthUserFieldsFragmentDoc,
    "\n  fragment AuthAccountFields on AuthAccount {\n    id\n    providerId\n    accountId\n    userId\n    createdAt\n    updatedAt\n  }\n": typeof types.AuthAccountFieldsFragmentDoc,
    "\n  fragment AuthSessionFields on AuthSession {\n    id\n    isCurrent\n    expiresAt\n    ipAddress\n    userAgent\n    createdAt\n    updatedAt\n  }\n": typeof types.AuthSessionFieldsFragmentDoc,
    "\n  mutation SummarizeDay {\n    summarizeDay {\n      ...DaySummaryFields\n    }\n  }\n": typeof types.SummarizeDayDocument,
    "\n  query ListTodos {\n    todos {\n      ...TodoFields\n    }\n  }\n": typeof types.ListTodosDocument,
    "\n  query GetTodo($id: String!) {\n    todo(id: $id) {\n      ...TodoFields\n    }\n  }\n": typeof types.GetTodoDocument,
    "\n  mutation CreateTodo($input: CreateTodoInput!) {\n    createTodo(input: $input) {\n      ...TodoFields\n    }\n  }\n": typeof types.CreateTodoDocument,
    "\n  mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {\n    updateTodo(id: $id, input: $input) {\n      ...TodoFields\n    }\n  }\n": typeof types.UpdateTodoDocument,
    "\n  mutation DeleteTodo($id: String!) {\n    deleteTodo(id: $id)\n  }\n": typeof types.DeleteTodoDocument,
    "\n  mutation SuggestTodo($draft: DraftInput!) {\n    suggestTodo(draft: $draft) {\n      ...TodoSuggestionFields\n    }\n  }\n": typeof types.SuggestTodoDocument,
};
const documents: Documents = {
    "\n  mutation NlSearch($query: String!) {\n    nlSearch(query: $query) {\n      criteria {\n        ...CriteriaFields\n      }\n      todos {\n        ...TodoFields\n      }\n    }\n  }\n": types.NlSearchDocument,
    "\n  query Me {\n    me {\n      ...AuthUserFields\n    }\n  }\n": types.MeDocument,
    "\n  query MyAccounts {\n    myAccounts {\n      ...AuthAccountFields\n    }\n  }\n": types.MyAccountsDocument,
    "\n  query MySessions {\n    mySessions {\n      ...AuthSessionFields\n    }\n  }\n": types.MySessionsDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...AuthUserFields\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation ChangeEmail($input: ChangeEmailInput!) {\n    changeEmail(input: $input)\n  }\n": types.ChangeEmailDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n": types.ChangePasswordDocument,
    "\n  mutation UnlinkAccount($input: UnlinkAccountInput!) {\n    unlinkAccount(input: $input)\n  }\n": types.UnlinkAccountDocument,
    "\n  mutation RevokeSession($input: RevokeSessionInput!) {\n    revokeSession(input: $input)\n  }\n": types.RevokeSessionDocument,
    "\n  mutation RevokeOtherSessions {\n    revokeOtherSessions\n  }\n": types.RevokeOtherSessionsDocument,
    "\n  fragment TodoFields on Todo {\n    id\n    title\n    description\n    priority\n    dueDate\n    completed\n    createdAt\n    updatedAt\n    subtasks {\n      id\n      title\n      done\n    }\n  }\n": types.TodoFieldsFragmentDoc,
    "\n  fragment TodoSuggestionFields on TodoSuggestion {\n    title\n    description\n    priority\n    subtasks\n  }\n": types.TodoSuggestionFieldsFragmentDoc,
    "\n  fragment CriteriaFields on Criteria {\n    query\n    keywords\n    status\n    priority\n    due\n  }\n": types.CriteriaFieldsFragmentDoc,
    "\n  fragment DaySummaryFields on DaySummary {\n    summary\n    focus\n    suggestedOrder\n  }\n": types.DaySummaryFieldsFragmentDoc,
    "\n  fragment AuthUserFields on AuthUser {\n    id\n    name\n    email\n    emailVerified\n    image\n    createdAt\n    updatedAt\n  }\n": types.AuthUserFieldsFragmentDoc,
    "\n  fragment AuthAccountFields on AuthAccount {\n    id\n    providerId\n    accountId\n    userId\n    createdAt\n    updatedAt\n  }\n": types.AuthAccountFieldsFragmentDoc,
    "\n  fragment AuthSessionFields on AuthSession {\n    id\n    isCurrent\n    expiresAt\n    ipAddress\n    userAgent\n    createdAt\n    updatedAt\n  }\n": types.AuthSessionFieldsFragmentDoc,
    "\n  mutation SummarizeDay {\n    summarizeDay {\n      ...DaySummaryFields\n    }\n  }\n": types.SummarizeDayDocument,
    "\n  query ListTodos {\n    todos {\n      ...TodoFields\n    }\n  }\n": types.ListTodosDocument,
    "\n  query GetTodo($id: String!) {\n    todo(id: $id) {\n      ...TodoFields\n    }\n  }\n": types.GetTodoDocument,
    "\n  mutation CreateTodo($input: CreateTodoInput!) {\n    createTodo(input: $input) {\n      ...TodoFields\n    }\n  }\n": types.CreateTodoDocument,
    "\n  mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {\n    updateTodo(id: $id, input: $input) {\n      ...TodoFields\n    }\n  }\n": types.UpdateTodoDocument,
    "\n  mutation DeleteTodo($id: String!) {\n    deleteTodo(id: $id)\n  }\n": types.DeleteTodoDocument,
    "\n  mutation SuggestTodo($draft: DraftInput!) {\n    suggestTodo(draft: $draft) {\n      ...TodoSuggestionFields\n    }\n  }\n": types.SuggestTodoDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation NlSearch($query: String!) {\n    nlSearch(query: $query) {\n      criteria {\n        ...CriteriaFields\n      }\n      todos {\n        ...TodoFields\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation NlSearch($query: String!) {\n    nlSearch(query: $query) {\n      criteria {\n        ...CriteriaFields\n      }\n      todos {\n        ...TodoFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      ...AuthUserFields\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      ...AuthUserFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyAccounts {\n    myAccounts {\n      ...AuthAccountFields\n    }\n  }\n"): (typeof documents)["\n  query MyAccounts {\n    myAccounts {\n      ...AuthAccountFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MySessions {\n    mySessions {\n      ...AuthSessionFields\n    }\n  }\n"): (typeof documents)["\n  query MySessions {\n    mySessions {\n      ...AuthSessionFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...AuthUserFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...AuthUserFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeEmail($input: ChangeEmailInput!) {\n    changeEmail(input: $input)\n  }\n"): (typeof documents)["\n  mutation ChangeEmail($input: ChangeEmailInput!) {\n    changeEmail(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n"): (typeof documents)["\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnlinkAccount($input: UnlinkAccountInput!) {\n    unlinkAccount(input: $input)\n  }\n"): (typeof documents)["\n  mutation UnlinkAccount($input: UnlinkAccountInput!) {\n    unlinkAccount(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RevokeSession($input: RevokeSessionInput!) {\n    revokeSession(input: $input)\n  }\n"): (typeof documents)["\n  mutation RevokeSession($input: RevokeSessionInput!) {\n    revokeSession(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RevokeOtherSessions {\n    revokeOtherSessions\n  }\n"): (typeof documents)["\n  mutation RevokeOtherSessions {\n    revokeOtherSessions\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TodoFields on Todo {\n    id\n    title\n    description\n    priority\n    dueDate\n    completed\n    createdAt\n    updatedAt\n    subtasks {\n      id\n      title\n      done\n    }\n  }\n"): (typeof documents)["\n  fragment TodoFields on Todo {\n    id\n    title\n    description\n    priority\n    dueDate\n    completed\n    createdAt\n    updatedAt\n    subtasks {\n      id\n      title\n      done\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TodoSuggestionFields on TodoSuggestion {\n    title\n    description\n    priority\n    subtasks\n  }\n"): (typeof documents)["\n  fragment TodoSuggestionFields on TodoSuggestion {\n    title\n    description\n    priority\n    subtasks\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment CriteriaFields on Criteria {\n    query\n    keywords\n    status\n    priority\n    due\n  }\n"): (typeof documents)["\n  fragment CriteriaFields on Criteria {\n    query\n    keywords\n    status\n    priority\n    due\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment DaySummaryFields on DaySummary {\n    summary\n    focus\n    suggestedOrder\n  }\n"): (typeof documents)["\n  fragment DaySummaryFields on DaySummary {\n    summary\n    focus\n    suggestedOrder\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AuthUserFields on AuthUser {\n    id\n    name\n    email\n    emailVerified\n    image\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment AuthUserFields on AuthUser {\n    id\n    name\n    email\n    emailVerified\n    image\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AuthAccountFields on AuthAccount {\n    id\n    providerId\n    accountId\n    userId\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment AuthAccountFields on AuthAccount {\n    id\n    providerId\n    accountId\n    userId\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AuthSessionFields on AuthSession {\n    id\n    isCurrent\n    expiresAt\n    ipAddress\n    userAgent\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment AuthSessionFields on AuthSession {\n    id\n    isCurrent\n    expiresAt\n    ipAddress\n    userAgent\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SummarizeDay {\n    summarizeDay {\n      ...DaySummaryFields\n    }\n  }\n"): (typeof documents)["\n  mutation SummarizeDay {\n    summarizeDay {\n      ...DaySummaryFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListTodos {\n    todos {\n      ...TodoFields\n    }\n  }\n"): (typeof documents)["\n  query ListTodos {\n    todos {\n      ...TodoFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTodo($id: String!) {\n    todo(id: $id) {\n      ...TodoFields\n    }\n  }\n"): (typeof documents)["\n  query GetTodo($id: String!) {\n    todo(id: $id) {\n      ...TodoFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTodo($input: CreateTodoInput!) {\n    createTodo(input: $input) {\n      ...TodoFields\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTodo($input: CreateTodoInput!) {\n    createTodo(input: $input) {\n      ...TodoFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {\n    updateTodo(id: $id, input: $input) {\n      ...TodoFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {\n    updateTodo(id: $id, input: $input) {\n      ...TodoFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTodo($id: String!) {\n    deleteTodo(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteTodo($id: String!) {\n    deleteTodo(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SuggestTodo($draft: DraftInput!) {\n    suggestTodo(draft: $draft) {\n      ...TodoSuggestionFields\n    }\n  }\n"): (typeof documents)["\n  mutation SuggestTodo($draft: DraftInput!) {\n    suggestTodo(draft: $draft) {\n      ...TodoSuggestionFields\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;