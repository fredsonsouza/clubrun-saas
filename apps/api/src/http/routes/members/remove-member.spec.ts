import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('Remove Member (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to remove a member as admin', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const memberIdToRemove = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'admin-member-id',
      userId,
      role: 'ADMIN',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/members/${memberIdToRemove}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.member.delete).toHaveBeenCalledWith({
      where: {
        id: memberIdToRemove,
        clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      },
    })
  })

  it('should not be able to remove a member if user is just a MEMBER', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const memberIdToRemove = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'MEMBER',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/members/${memberIdToRemove}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
