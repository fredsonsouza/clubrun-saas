import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
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
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToUpdate = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId,
      role: 'OWNER',
      club: {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        slug: 'acme-club',
        ownerId: userId,
      },
      user: { isSystemAdmin: false },
    } as any)

    vi.mocked(prisma.member.findUnique).mockResolvedValue({
      id: memberIdToUpdate,
      userId: 'some-other-user-id',
      role: 'ATHLETE',
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
      where: {
        id: memberIdToUpdate,
        clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      },
      data: expect.objectContaining({
        role: 'ADMIN',
        status: 'INACTIVE',
      }),
    })
  })

  it('should demote existing MANAGER when a new one is assigned', async () => {
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToUpdate = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId,
      role: 'OWNER',
      clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      club: {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        slug: 'acme-club',
        ownerId: userId,
      },
      user: { isSystemAdmin: false },
    } as any)

    vi.mocked(prisma.member.findUnique).mockResolvedValue({
      id: memberIdToUpdate,
      userId: 'some-other-user-id',
      role: 'ATHLETE',
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/members/${memberIdToUpdate}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        role: 'MANAGER',
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.member.updateMany).toHaveBeenCalledWith({
      where: {
        clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        role: 'MANAGER',
        id: { not: memberIdToUpdate },
      },
      data: {
        role: 'ATHLETE',
      },
    })
  })

  it('should not be able to update a member if user is not authorized', async () => {
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToUpdate = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: 'club-id', slug: 'acme-club' },
      user: { isSystemAdmin: false },
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/members/${memberIdToUpdate}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        role: 'MANAGER',
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it.each(['MANAGER', 'ADMIN'] as const)(
    'should not allow %s to update member roles',
    async (role) => {
      const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
      const memberIdToUpdate = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
      const token = app.jwt.sign({ sub: userId })

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: 'member-id',
        userId,
        role,
        clubId: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
        club: {
          id: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
          slug: 'acme-club',
          ownerId: 'real-owner-id',
        },
        user: { isSystemAdmin: false },
      } as any)

      const response = await app.inject({
        method: 'PUT',
        url: `/clubs/acme-club/members/${memberIdToUpdate}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: {
          role: 'COACH',
        },
      })

      expect(response.statusCode).toBe(403)
      expect(prisma.member.findUnique).not.toHaveBeenCalled()
      expect(prisma.member.update).not.toHaveBeenCalled()
    }
  )

  it('should reject assigning OWNER outside the transfer flow', async () => {
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToUpdate = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId,
      role: 'OWNER',
      clubId: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
      club: {
        id: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
        slug: 'acme-club',
        ownerId: userId,
      },
      user: { isSystemAdmin: false },
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/members/${memberIdToUpdate}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        role: 'OWNER',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(prisma.member.update).not.toHaveBeenCalled()
  })

  it('should scope the target member lookup to the current club', async () => {
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToUpdate = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId,
      role: 'OWNER',
      clubId: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
      club: {
        id: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
        slug: 'acme-club',
        ownerId: userId,
      },
      user: { isSystemAdmin: false },
    } as any)
    vi.mocked(prisma.member.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/members/${memberIdToUpdate}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        role: 'ATHLETE',
      },
    })

    expect(response.statusCode).toBe(404)
    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: {
        id: memberIdToUpdate,
        clubId: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
      },
    })
    expect(prisma.member.update).not.toHaveBeenCalled()
  })

  it('should reject VISITOR as a persisted member role', async () => {
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToUpdate = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/members/${memberIdToUpdate}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        role: 'VISITOR',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(prisma.member.update).not.toHaveBeenCalled()
  })
})
