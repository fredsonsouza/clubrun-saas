import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Get Profile (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get authenticated user profile', async () => {
    const userId = '0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p'.replace(/g|h|i|j|k|l|m|n|o|p/g, 'a') 
    // Just kidding, I'll use a real one
    const validUserId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'

    const token = app.jwt.sign({ sub: validUserId })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: validUserId,
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar.jpg',
      isSystemAdmin: false,
      emailVerifiedAt: null,
      passwordHash: null,
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      user: {
        id: validUserId,
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: 'http://example.com/avatar.jpg',
        isSystemAdmin: false,
        emailVerifiedAt: null,
        hasPassword: false,
      },
    })
  })

  it('should not be able to get profile if user does not exist', async () => {
    const userId = 'non-existing-user-id'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'GET',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('User not found!')
  })

  it('should not be able to get profile with invalid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profile',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().message).toBe('Invalid auth token')
  })
})
