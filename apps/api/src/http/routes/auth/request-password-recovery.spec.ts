import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    token: {
      create: vi.fn(),
    },
  },
}))

describe('Request Password Recovery (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should be able to request password recovery', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'john@example.com',
    } as any)

    vi.mocked(prisma.token.create).mockResolvedValue({
      id: 'token-id',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/password/recovery',
      body: {
        email: 'john@example.com',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.token.create).toHaveBeenCalledWith({
      data: {
        type: 'PASSWORD_RECOVER',
        userId: 'user-id',
      },
    })
  })

  it('should not be able to request password recovery if user does not exist (silently)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'POST',
      url: '/password/recovery',
      body: {
        email: 'invalid-email@example.com',
      },
    })

    // Deve retornar 201 por segurança
    expect(response.statusCode).toBe(201)
    // Não deve criar token
    expect(prisma.token.create).not.toHaveBeenCalled()
  })
})
