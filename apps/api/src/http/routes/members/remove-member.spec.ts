import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    invoice: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
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

  it('should be able to remove a member as system admin', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const memberIdToRemove = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'admin-member-id',
      userId,
      role: 'ADMIN',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
      user: { isSystemAdmin: true }
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/members/${memberIdToRemove}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
  })

  it('should not be able to remove a member as OWNER if they have no overdue invoices', async () => {
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToRemove = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId,
      role: 'OWNER',
      club: { id: 'club-id', slug: 'acme-club' },
      user: { isSystemAdmin: false }
    } as any)

    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/members/${memberIdToRemove}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({
      message: 'Members can only be removed if they have overdue payments.'
    })
  })

  it('should be able to remove a member as OWNER if they have overdue invoices', async () => {
    const userId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const memberIdToRemove = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId,
      role: 'OWNER',
      club: { id: 'club-id', slug: 'acme-club' },
      user: { isSystemAdmin: false }
    } as any)

    vi.mocked(prisma.invoice.findFirst).mockResolvedValue({ id: '81f02179-8d75-474c-8975-c54d8b965c4d' } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/members/${memberIdToRemove}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
  })
})
