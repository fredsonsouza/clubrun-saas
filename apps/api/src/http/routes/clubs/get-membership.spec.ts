import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
  },
}))

describe('Get Membership (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get user membership details', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
      userId,
      role: 'ADMIN',
      clubId,
      club: { id: clubId, slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/membership',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    if (response.statusCode === 500) {
      process.stderr.write('500 Error Body: ' + JSON.stringify(response.json(), null, 2) + '\n')
    }
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      membership: {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        userId,
        role: 'ADMIN',
        clubId,
      },
    })
  })
})
