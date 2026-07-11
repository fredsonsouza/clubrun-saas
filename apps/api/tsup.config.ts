import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/http/server.ts'],
  format: ['cjs'],
  shims: true,
  clean: true,
  noExternal: ['@saas/auth', '@saas/env'],
})
