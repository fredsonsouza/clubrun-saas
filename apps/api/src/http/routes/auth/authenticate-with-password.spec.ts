import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}))

describe('Authenticate with Password (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to authenticate with e-mail & password', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
    } as any)

    vi.mocked(compare).mockResolvedValue(true as any)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: {
        login: 'john@example.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toHaveProperty('token')
  })

  it('should not be able to authenticate with non-existing user', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: {
        login: 'non-existing@example.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Invalid credentials')
  })

  it('should not be able to authenticate with wrong password', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
    } as any)

    vi.mocked(compare).mockResolvedValue(false as any)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: {
        login: 'john@example.com',
        password: 'wrong-password',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Invalid credentials')
  })

  it('should not be able to authenticate if user has no password (social login only)', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
      email: 'john@example.com',
      passwordHash: null,
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      body: {
        login: 'john@example.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe(
      'User does not have a password, use social login'
    )
  })
})
