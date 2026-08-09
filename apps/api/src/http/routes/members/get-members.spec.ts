import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('Get Members (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to list club members', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ADMIN',
      club: { id: 'club-id', slug: 'acme-club' },
      user: { isSystemAdmin: false },
    } as any)

    vi.mocked(prisma.member.findMany).mockResolvedValue([
      {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        role: 'OWNER',
        userId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        createdAt: new Date(),
        user: {
          id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
          name: 'John Doe',
          email: 'johndoe@example.com',
          avatarUrl: 'http://example.com/avatar.jpg',
        },
        invoices: [],
      },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/members',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().members).toHaveLength(1)
    expect(response.json().members[0]).toEqual(
      expect.objectContaining({
        userId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        role: 'OWNER',
        overdue: false,
      })
    )
    expect(response.json().members[0]).not.toHaveProperty('email')
    expect(response.json().members[0]).not.toHaveProperty('birthDate')
    expect(response.json().members[0]).not.toHaveProperty(
      'hasMedicalConditions'
    )
    expect(response.json().members[0]).not.toHaveProperty('medicalConditions')
    expect(prisma.member.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clubId: 'club-id', status: 'ACTIVE' },
      })
    )
  })

  it('should be able to list members as BILLING role', async () => {
    const userId = 'billing-user-id'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'BILLING',
      club: { id: 'club-id', slug: 'acme-club' },
      user: { isSystemAdmin: false },
    } as any)

    vi.mocked(prisma.member.findMany).mockResolvedValue([])

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/members',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
  })

  it('should not list members to a pending visitor', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'pending-member-id',
      userId,
      role: 'ATHLETE',
      status: 'PENDING',
      clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      club: {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        slug: 'acme-club',
        ownerId: 'owner-id',
      },
      user: { isSystemAdmin: false },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/members',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.member.findMany).not.toHaveBeenCalled()
  })
})
