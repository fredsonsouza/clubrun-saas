import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    club: { update: vi.fn() },
    member: { findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}))

describe('Activate Billing simulation policy (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 403 without changing billing outside development/test', async () => {
    vi.stubEnv('NODE_ENV', 'staging')
    const token = app.jwt.sign({
      sub: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
    })

    const response = await app.inject({
      method: 'PATCH',
      url: '/clubs/test-club/billing/activate',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.club.update).not.toHaveBeenCalled()
  })
})
