import { pool, prisma } from '@/lib/prisma'
import { afterAll } from 'vitest'

afterAll(async () => {
  await prisma.$disconnect()
  if (pool && !(pool as any).ending) {
    await pool.end()
  }
})
