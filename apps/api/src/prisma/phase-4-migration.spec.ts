import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Client } from 'pg'
import { describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)

describe('Phase 4 migration (integration)', () => {
  it.runIf(Boolean(process.env.RUN_MIGRATION_INTEGRATION))(
    'applies the email outbox migration and exposes its schema',
    async () => {
      expect(process.env.DATABASE_URL).toBeTruthy()
      await execFileAsync(
        'pnpm',
        [
          'exec',
          'prisma',
          'migrate',
          'deploy',
          '--schema',
          'prisma/schema.prisma',
        ],
        { cwd: process.cwd(), env: process.env }
      )

      const client = new Client({ connectionString: process.env.DATABASE_URL })
      await client.connect()
      try {
        const result = await client.query<{ exists: boolean }>(
          "SELECT to_regclass('public.email_outbox') IS NOT NULL AS exists"
        )
        expect(result.rows[0]?.exists).toBe(true)

        const columns = await client.query<{ column_name: string }>(
          "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_outbox'"
        )
        expect(columns.rows.map((row) => row.column_name)).toEqual(
          expect.arrayContaining([
            'id',
            'to_address',
            'idempotency_key',
            'status',
            'next_attempt_at',
          ])
        )
      } finally {
        await client.end()
      }
    }
  )
})
