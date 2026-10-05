export const authQueryKeys = {
  me: 'app:auth:me',
  accounts: 'app:auth:accounts',
  sessions: 'app:auth:sessions',
  writeTargets: () =>
    [authQueryKeys.me, authQueryKeys.accounts, authQueryKeys.sessions] as string[],
} as const
