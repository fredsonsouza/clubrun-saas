import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    club: {
      findMany: vi.fn(),
    },
  },
}))

describe('Get Clubs (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to list clubs where user is a member', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.club.findMany).mockResolvedValue([
      {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        name: 'Club 1',
        slug: 'club-1',
        avatarUrl: 'http://example.com/avatar1.jpg',
        members: [{ role: 'ADMIN' }],
      },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      clubs: [
        {
          id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
          name: 'Club 1',
          slug: 'club-1',
          avatarUrl: 'http://example.com/avatar1.jpg',
          role: 'ADMIN',
        },
      ],
    })
  })
})
