import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    dir: 'src',
    globals: true,
    coverage: {
      all: false,
    },
    env: {
      DATABASE_URL: 'postgresql://dev:ignite@localhost:5432/club_run',
      JWT_SECRET: 'test-jwt-secret-key-for-vitest-at-least-32-bytes',
      JWT_ISSUER: 'club-run-api-test',
      JWT_AUDIENCE: 'club-run-test-clients',
      TOKEN_PEPPER: 'test-token-pepper-at-least-32-bytes-long',
      GOOGLE_OAUTH_CLIENT_ID: 'test-google-client-id',
      GOOGLE_OAUTH_CLIENT_SECRET: 'test-google-client-secret',
      GOOGLE_OAUTH_CLIENT_REDIRECT_URI:
        'http://localhost:3333/api/auth/callback/google',
      NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: 'test-mapbox-token',
      RESEND_API_KEY: 'test-resend-api-key',
    },
    globalSetup: ['./src/test/global-teardown.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          dir: 'src',
          include: ['**/*.spec.ts'],
          exclude: ['**/*.e2e-spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          dir: 'src/http/routes',
          include: ['**/*.e2e-spec.ts'],
          environment:
            './prisma/vitest-environment-prisma/prisma-test-environment.ts',
          setupFiles: ['./src/test/setup-e2e.ts'],
          forks: {
            singleFork: true,
          },
        },
      },
    ],
  },
})
