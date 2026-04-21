import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('Get Club Billing (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get club billing information as owner', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    // Mock do getUserMemberShip (chamado internamente)
    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'OWNER',
      club: { id: 'club-id', slug: 'acme-club' },
    } as any)

    // Mock do count de membros
    vi.mocked(prisma.member.count).mockResolvedValue(5)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/billing',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      billing: {
        seats: {
          amount: 5,
          unit: 10,
          price: 50,
        },
        total: 50,
      },
    })
  })

  it('should not be able to get billing if user is just a MEMBER', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'MEMBER',
      club: { id: 'club-id', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/billing',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().message).toBe(
      "You're not allowed to get billing details from this club."
    )
  })
})
