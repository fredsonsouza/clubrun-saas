import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import type { ContextTestEnvironment } from 'vitest'

export default (<ContextTestEnvironment>{
  options: {},
  name: 'prisma',
  viteEnvironment: 'ssr',
  async setup() {
    const dbName = `test_${randomUUID().replace(/-/g, '_')}`

    if (!process.env.DATABASE_URL) {
      throw new Error('Please provide a DATABASE_URL env variable')
    }

    const originalUrl = process.env.DATABASE_URL
    const url = new URL(originalUrl)
    url.pathname = `/${dbName}`
    url.searchParams.delete('schema')
    const databaseUrl = url.toString()

    // Como o Prisma está usando Driver Adapters (engineType="client"),
    // não podemos instanciar o PrismaClient puro sem o adapter.
    // Usamos o pacote 'pg' (ou a CLI do prisma) para criar o banco:
    let Client: any
    try {
      // @ts-ignore
      const pg = await import('pg')
      Client = pg.Client || pg.default?.Client
    } catch (err) {}

    if (Client) {
      const client = new Client({ connectionString: originalUrl })
      await client.connect()
      await client.query(`CREATE DATABASE "${dbName}"`)
      await client.end()
    } else {
      execSync(`npx prisma db execute --url "${originalUrl}" --stdin`, {
        input: `CREATE DATABASE "${dbName}";`,
      })
    }

    process.env.DATABASE_URL = databaseUrl

    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
    })

    return {
      async teardown() {
        // Redundância removida, agora tratado pelo globalSetup e setup-e2e

        if (Client) {
          const client = new Client({ connectionString: originalUrl })
          await client.connect()
          await client.query(
            `SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbName}' AND pid <> pg_backend_pid();`
          )
          await client.query(`DROP DATABASE "${dbName}";`)
          await client.end()
        } else {
          execSync(`npx prisma db execute --url "${originalUrl}" --stdin`, {
            input: `SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbName}' AND pid <> pg_backend_pid();`,
          })
          execSync(`npx prisma db execute --url "${originalUrl}" --stdin`, {
            input: `DROP DATABASE "${dbName}";`,
          })
        }
      },
    }
  },
})
