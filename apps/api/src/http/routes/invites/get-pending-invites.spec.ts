import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    invite: {
      findMany: vi.fn(),
    },
  },
}))

describe('Get Pending Invites (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get all user pending invites', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      email: 'johndoe@example.com',
    } as any)

    vi.mocked(prisma.invite.findMany).mockResolvedValue([
      {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        role: 'ATHLETE',
        email: 'johndoe@example.com',
        createdAt: new Date(),
        club: { name: 'Acme Club' },
        author: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', name: 'Author', avatarUrl: null },
      },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/pending-invites',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().invites).toHaveLength(1)
    expect(response.json().invites[0].club.name).toBe('Acme Club')
  })
})
