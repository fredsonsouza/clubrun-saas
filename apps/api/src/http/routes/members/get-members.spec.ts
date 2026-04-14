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
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.member.findMany).mockResolvedValue([
      {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        role: 'OWNER',
        user: {
          id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
          name: 'John Doe',
          email: 'johndoe@example.com',
          avatarUrl: 'http://example.com/avatar.jpg',
        },
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
    expect(response.json().members[0]).toEqual(expect.objectContaining({
      userId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      role: 'OWNER',
    }))
  })

  it('should not be able to list members if user is not authorized', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'BILLING', // BILLING is NOT authorized to see members
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/members',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
