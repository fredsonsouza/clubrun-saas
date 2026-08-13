import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/utils/identity'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/identity', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/identity')>()),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}))

describe('Authenticate with Password (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
      passwordHash: '$argon2id$hash',
      sessionVersion: 3,
    } as any)
    vi.mocked(verifyPassword).mockResolvedValue({
      valid: true,
      needsRehash: false,
    })
  })

  it('normalizes e-mail and issues a 15 minute session with sessionVersion', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: { login: ' John@Example.COM ', password: 'password123' },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ email: 'john@example.com' }, { username: 'john@example.com' }],
      },
      select: { id: true, passwordHash: true, sessionVersion: true },
    })
    const payload = app.jwt.decode(response.json().token) as any
    expect(payload).toMatchObject({
      sub: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
      sv: 3,
      iss: 'club-run-api-test',
      aud: 'club-run-test-clients',
    })
    expect(payload.exp - payload.iat).toBe(15 * 60)
  })

  it('rehashes a valid legacy bcrypt password opportunistically', async () => {
    vi.mocked(verifyPassword).mockResolvedValue({
      valid: true,
      needsRehash: true,
    })
    vi.mocked(hashPassword).mockResolvedValue('$argon2id$new-hash')

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: { login: 'runner', password: 'legacy-password' },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
        passwordHash: '$argon2id$hash',
      },
      data: { passwordHash: '$argon2id$new-hash' },
    })
  })

  it('returns generic invalid credentials for a missing user or password', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: { login: 'unknown@example.com', password: 'password123' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      code: 'BAD_REQUEST',
      message: 'Invalid credentials',
    })
  })

  it('rejects an invalid password', async () => {
    vi.mocked(verifyPassword).mockResolvedValue({
      valid: false,
      needsRehash: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: { login: 'john@example.com', password: 'wrong-password' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      code: 'BAD_REQUEST',
      message: 'Invalid credentials',
    })
  })
})
