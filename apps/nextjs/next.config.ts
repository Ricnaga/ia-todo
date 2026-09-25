import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ia-task-manager/schemas',
    '@ia-task-manager/server',
    '@ia-task-manager/bff',
  ],
  serverExternalPackages: ['better-sqlite3', '@prisma/client', '@prisma/adapter-better-sqlite3'],
}

export default nextConfig
