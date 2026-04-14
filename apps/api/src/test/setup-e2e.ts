import { afterAll } from 'vitest'
import { prisma, pool } from '@/lib/prisma'

afterAll(async () => {
  await prisma.$disconnect()
  if (pool && !(pool as any).ending) {
    await pool.end()
  }
})
