import { firstGraphQLError } from '@ia-task-manager/bff/graphql'
import { ClientError, GraphQLClient } from 'graphql-request'
import type { RequestOptions } from './graphql.types'

export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED'

export class GraphQLRequestError extends Error {
  readonly code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'GraphQLRequestError'
    this.code = code
  }
}

function toRequestError(error: ClientError): GraphQLRequestError {
  const payload = firstGraphQLError(error.response)
  return new GraphQLRequestError(payload?.message ?? error.message, payload?.extensions?.code)
}

/**
 * Este arquivo e compartilhado: `use-session-guard.ts` importa o contrato de erro
 * dele e roda no browser. Por isso ele nao importa o BFF nem le `process.env` --
 * o schema, o better-auth e o Yoga sao de servidor, e o env de servidor nao
 * existe no bundle do cliente.
 *
 * Sao dois transportes, um por ambiente:
 *
 *   browser  -> `window.location.origin`, que e o route handler de
 *               `app/api/graphql/route.ts`. E a unica opcao no browser: a
 *               chamada precisa sair da maquina.
 *   servidor -> o Yoga do BFF, injetado por `instrumentation.ts` no `register()`.
 *               Antes isso o servidor falava com a propria URL publica via
 *               `BETTER_AUTH_URL`, que e uma ida e volta pela rede a cada
 *               request de SSR e quebra em container sem DNS publico.
 *
 * Os dois passam pelo mesmo `graphql-request`, entao Status, `ClientError` e a
 * conversao para `GraphQLRequestError` sao identicos nos dois caminhos. E o
 * que o `use-session-guard` usa para mandar o usuario para o login.
 */
let browserClient: GraphQLClient | undefined

/**
 * O cliente do servidor mora no `globalThis`, e nao numa variavel deste modulo.
 *
 * `instrumentation.ts` e o route handler sao bundles separados, entao cada um
 * carrega sua propria instancia deste arquivo: uma variavel de modulo receberia
 * a escrita num bundle e a leitura no outro, e o `register()` nao apareceria no
 * `getClient()`. O `globalThis` e o unico objeto que os dois bundles do mesmo
 * processo compartilham.
 *
 * `Symbol.for` e nao `Symbol()` porque a chave precisa ser identica tambem entre
 * as duas instancias do modulo: `Symbol()` cria uma chave unica por instancia e
 * o registro nao seria encontrado.
 */
const REGISTRY = Symbol.for('@ia-task-manager/nextjs/graphql')

type ServerRegistry = { client?: GraphQLClient }

function serverRegistry(): ServerRegistry {
  const store = globalThis as { [REGISTRY]?: ServerRegistry }
  store[REGISTRY] ??= {}
  return store[REGISTRY]
}

export function setServerGraphQLClient(client: GraphQLClient): void {
  serverRegistry().client = client
}

const SEM_TRANSPORTE =
  'GraphQL: o transporte do servidor nao foi registrado. `instrumentation.ts` ' +
  'tem que estar na raiz do app e chamar `register()`; sem ele, o SSR nao tem ' +
  'como falar com o BFF sem sair pela rede.'

function getClient(): GraphQLClient {
  if (typeof window === 'undefined') {
    const client = serverRegistry().client
    if (!client) throw new Error(SEM_TRANSPORTE)
    return client
  }

  browserClient ??= new GraphQLClient(`${window.location.origin}/api/graphql`)
  return browserClient
}

/**
 * Envia um documento GraphQL e devolve o `data` ja tipado.
 *
 * `document` e um `Document<TResult, TVariables>` gerado pelo codegen, e nao uma
 * string: os dois genéricos sao inferidos do documento, entao a chamada fica
 * `request({ document: ListTodosDocument })` -- sem `<T>` explicito, sem `as` e
 * sem o `Record<never, never>` que antes proibia passar variaveis. Os argumentos
 * vem em `RequestOptions`, nomeados.
 *
 * O `object` que vai como segundo parametro de tipo do `graphql-request` e
 * deliberado, e nao uma folga. O cliente decide entre `variables` obrigatorio e
 * opcional com um condicional (`V extends Record<any, never> ? ... : ...`), e
 * esse condicional nao resolve quando `V` e um generico nosso -- nenhuma das
 * formas de passar `TVariables` diretamente compila. Fixando `V = object`, o
 * cliente enxerga um tipo concreto. A precisao nao se perde: `variables` ja foi
 * conferido contra o `TVariables` do documento na assinatura desta funcao, e e
 * aqui que a semantica de "variaveis batem com a operacao" ja esta garantida.
 * Para o transporte, sao so um objeto.
 *
 * O proprio `graphql-request` imprime o documento (o `analyzeDocument` dele
 * importa `print` do `graphql`), entao este app nao chama `print`.
 */
export async function request<TResult, TVariables extends object>({
  document,
  variables,
  headers,
}: RequestOptions<TResult, TVariables>): Promise<TResult> {
  try {
    return await getClient().request<TResult, object>(document, variables, headers)
  } catch (error) {
    if (error instanceof ClientError) {
      throw toRequestError(error)
    }
    throw error
  }
}
