import { getUserPermissions } from '@/utils/get-user-permissions'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { roleSchema } from '@saas/auth'
import { auth } from '@/http/middlewares/auth'

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
                  role: roleSchema,
                  name: z.string().nullable(),
                  email: z.string().email().or(z.null()),
                  avatarUrl: z.string().nullable(),
                  overdue: z.boolean(),
                  paceAvg: z.number().nullable(),
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
          memberShip.clubId
        )

        if (cannot('get', 'User')) {
          throw new UnauthorizedError(`Você não tem permissão para ver os membros deste clube`)
        }

        const members = await prisma.member.findMany({
          where: { clubId: club.id },
          include: {
            user: {
              include: {
                athleteProfile: true
              }
            },
            invoices: {
              select: { status: true }
            }
          },
          orderBy: { role: 'asc' }
        })

        const isPrivileged = ['ADMIN', 'OWNER', 'MANAGER'].includes(memberShip.role) || memberShip.isSystemAdmin

        const formattedMembers = members.map((m) => {
          return {
            id: m.id,
            userId: m.user.id,
            role: m.role,
            name: m.user.name || 'Atleta',
            email: isPrivileged ? m.user.email : null,
            avatarUrl: m.user.avatarUrl || null,
            paceAvg: m.user.athleteProfile?.paceAvg || null,
            overdue: isPrivileged ? m.invoices.some(i => i.status === 'OVERDUE') : false,
          }
        })

        return reply.send({ members: formattedMembers })
      }
    )
}
