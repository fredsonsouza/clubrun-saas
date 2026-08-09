import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { persistedRoleSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/members',
      {
        schema: {
          tags: ['members'],
          summary: 'Get all club members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  role: persistedRoleSchema,
                  name: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                  overdue: z.boolean(),
                  paceAvg: z.number().nullable(),
                  shoes: z.string().nullable().optional(),
                  watch: z.string().nullable().optional(),
                  joinedAt: z.string().datetime(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId,
          club.ownerId
        )

        if (cannot('get', 'User')) {
          throw new ForbiddenError(
            'Você não tem permissão para ver os membros deste clube'
          )
        }

        const members = await prisma.member.findMany({
          where: { clubId: club.id, status: 'ACTIVE' },
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                athleteProfile: {
                  select: {
                    paceAvg: true,
                    shoes: true,
                    watch: true,
                  },
                },
              },
            },
            invoices: {
              select: { status: true },
            },
          },
          orderBy: { role: 'asc' },
        })

        const isPrivileged =
          club.ownerId === userId ||
          ['ADMIN', 'MANAGER', 'BILLING'].includes(memberShip.role) ||
          memberShip.isSystemAdmin

        const formattedMembers = members.map((m) => {
          return {
            id: m.id,
            userId: m.user.id,
            role: m.role,
            name: m.user.name || 'Atleta',
            avatarUrl: m.user.avatarUrl || null,
            paceAvg: m.user.athleteProfile?.paceAvg || null,
            overdue: isPrivileged
              ? m.invoices.some((i) => i.status === 'OVERDUE')
              : false,
            shoes: m.user.athleteProfile?.shoes || null,
            watch: m.user.athleteProfile?.watch || null,
            joinedAt: m.createdAt.toISOString(),
          }
        })

        return reply.send({ members: formattedMembers })
      }
    )
}
