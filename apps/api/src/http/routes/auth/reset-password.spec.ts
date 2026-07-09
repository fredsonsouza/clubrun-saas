import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    token: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}))

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
}))

describe('Reset Password (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to reset password', async () => {
    vi.mocked(prisma.token.findUnique).mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
    } as any)

    vi.mocked(hash).mockResolvedValue('new-hashed-password' as any)

    const response = await app.inject({
      method: 'POST',
      url: '/password/reset',
      body: {
        code: 'token-id',
        password: 'new-password-123',
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { passwordHash: 'new-hashed-password' },
    })
    expect(prisma.token.delete).toHaveBeenCalledWith({
      where: { id: 'token-id' },
    })
  })

  it('should not be able to reset password with invalid token', async () => {
    vi.mocked(prisma.token.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'POST',
      url: '/password/reset',
      body: {
        code: 'invalid-token',
        password: 'new-password-123',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should not be able to reset password with short password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/password/reset',
      body: {
        code: 'some-token',
        password: '123',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Validation error')
  })
})
