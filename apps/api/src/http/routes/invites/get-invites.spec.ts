import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    invite: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('Get Invites (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get a specific invite', async () => {
    const inviteId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const authorId = '515560b4-367d-44a6-89bf-ba486e9e46a7'

    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: inviteId,
      role: 'MEMBER',
      email: 'johndoe@example.com',
      createdAt: new Date(),
      club: { name: 'Acme Club' },
      author: { id: authorId, name: 'Author', avatarUrl: null },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: `/invites/${inviteId}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().invite.id).toBe(inviteId)
  })

  it('should be able to list club invites', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const authorId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ADMIN',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.invite.findMany).mockResolvedValue([
      {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        role: 'MEMBER',
        email: 'johndoe@example.com',
        createdAt: new Date(),
        author: { id: authorId, name: 'Author' },
      },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/invites',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().invites).toHaveLength(1)
  })
})
