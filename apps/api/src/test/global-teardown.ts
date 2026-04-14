import { pool } from '@/lib/prisma'

export async function teardown() {
  if (pool && !(pool as any).ending) {
    await pool.end()
  }
}
