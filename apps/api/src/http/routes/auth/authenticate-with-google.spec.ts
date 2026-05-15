import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

describe('Authenticate with Google (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global fetch
    global.fetch = vi.fn()
  })

  it('should be able to authenticate with google', async () => {
    // 1. Mock do Google Token Response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'valid-google-token',
      }),
    })

    // 2. Mock do Google User Info Response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sub: 'google-id',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'http://example.com/avatar.jpg',
      }),
    })

    // 3. Mock do Prisma
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'user-id',
      email: 'john@example.com',
      name: 'John Doe',
      avatarUrl: 'http://example.com/avatar.jpg',
    } as any)
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.account.create).mockResolvedValue({} as any)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/google',
      body: {
        code: 'google-code',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toHaveProperty('token')
    
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: 'http://example.com/avatar.jpg',
        emailVerifiedAt: expect.any(Date),
        athleteProfile: {
          create: {
            isPublic: true,
          },
        },
      },
    })
  })

  it('should not be able to authenticate if google returns an error', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'invalid_grant',
        error_description: 'Code is expired',
      }),
    })

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/google',
      body: {
        code: 'expired-code',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      error: 'invalid_grant',
      error_description: 'Code is expired',
    })
  })

  it('should be able to link an existing user to a google account', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'link-token' }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sub: 'new-google-id',
        name: 'John Duo',
        email: 'john@example.com',
        picture: 'http://example.com/avatar.jpg',
      }),
    })

    const existingUser = {
      id: 'existing-id',
      email: 'john@example.com',
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any)
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'existing-id',
      email: 'john@example.com',
      emailVerifiedAt: new Date(),
    } as any)
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.account.create).mockResolvedValue({} as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/google',
      body: { code: 'some-code' },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        provider: 'GOOGLE',
        providerAccountId: 'new-google-id',
        userId: 'existing-id',
      },
    })
  })
})
