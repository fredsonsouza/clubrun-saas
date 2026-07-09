import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    club: {
      findFirst: vi.fn(),
    },
    invite: {
      findFirst: vi.fn(),
    },
    token: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
}))

describe('Create Account (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to create a new account', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.invite.findFirst).mockResolvedValue(null)
    vi.mocked(hash).mockResolvedValue('hashed-password' as any)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'user-id',
      email: 'john@example.com',
      username: 'johndoe',
    } as any)
    vi.mocked(prisma.token.create).mockResolvedValue({} as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          passwordHash: 'hashed-password',
        }),
      })
    )
  })

  it('should be able to create an account and auto-join a club by domain', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.club.findFirst).mockResolvedValue({
      id: 'club-id',
      domain: 'acme.com',
    } as any)
    vi.mocked(prisma.invite.findFirst).mockResolvedValue(null)
    vi.mocked(hash).mockResolvedValue('hashed-password' as any)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'user-id',
      email: 'john@acme.com',
      username: 'johndoe',
    } as any)
    vi.mocked(prisma.token.create).mockResolvedValue({} as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@acme.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          members_on: {
            create: [{ clubId: 'club-id' }],
          },
        }),
      })
    )
  })

  it('should not be able to create an account with existing e-mail', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-id',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe(
      'User with same e-mail already exists!'
    )
  })
})
