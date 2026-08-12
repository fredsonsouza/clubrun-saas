import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/identity'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/mail', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))
vi.mock('@/utils/identity', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/identity')>()),
  hashPassword: vi.fn(),
}))
vi.mock('@/lib/prisma', () => {
  const prisma = {
    user: { findUnique: vi.fn(), create: vi.fn() },
    token: { updateMany: vi.fn(), create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: any) => unknown) =>
      callback(prisma)
    ),
  }
  return { prisma }
})

describe('Create Account (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hashPassword).mockResolvedValue('argon2id-hash')
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'user-id',
      username: 'johndoe',
    } as any)
    vi.mocked(prisma.token.updateMany).mockResolvedValue({ count: 0 })
    vi.mocked(prisma.token.create).mockResolvedValue({} as any)
  })

  it('normalizes e-mail and creates only user, profile and verification token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'John Doe',
        username: 'johndoe',
        email: '  John@Example.COM ',
        password: 'a-secure-password',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'john@example.com',
        passwordHash: 'argon2id-hash',
        athleteProfile: { create: expect.any(Object) },
      }),
      select: { id: true, username: true },
    })
    const userData = vi.mocked(prisma.user.create).mock.calls[0][0].data
    expect(userData).not.toHaveProperty('members_on')
    expect(prisma.token.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        digest: expect.stringMatching(/^[a-f0-9]{64}$/),
        type: 'EMAIL_VERIFICATION',
        expiresAt: expect.any(Date),
        userId: 'user-id',
      }),
    })
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('does not consult memberships, clubs or invites during registration', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@acme.com',
        password: 'a-secure-password',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma).not.toHaveProperty('club')
    expect(prisma).not.toHaveProperty('invite')
    expect(prisma).not.toHaveProperty('member')
  })

  it('rejects a normalized duplicate e-mail', async () => {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ id: 'existing-id' } as any)
      .mockResolvedValueOnce(null)

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'John Doe',
        username: 'johndoe',
        email: ' JOHN@example.com ',
        password: 'a-secure-password',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
      select: { id: true },
    })
  })
})
