import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('Update Member (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to update a member as owner', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const memberIdToUpdate = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId,
      role: 'OWNER',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/members/${memberIdToUpdate}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        role: 'ADMIN',
        status: 'INACTIVE',
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: { id: memberIdToUpdate },
      data: expect.objectContaining({
        role: 'ADMIN',
        status: 'INACTIVE',
      }),
    })
  })

  it('should not be able to update a member if user is not authorized', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const memberIdToUpdate = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'MEMBER',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/members/${memberIdToUpdate}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        role: 'ADMIN',
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
