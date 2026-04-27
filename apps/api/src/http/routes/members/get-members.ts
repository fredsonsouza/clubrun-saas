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
                  id: z.uuid(),
                  userId: z.uuid(),
                  role: roleSchema,
                  name: z.string().nullable(),
                  email: z.string().email(),
                  avatarUrl: z.string().nullable(),
                  overdue: z.boolean(),
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

        const { cannot } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        if (cannot('get', 'User')) {
          throw new UnauthorizedError(`You're not allowed to see club members`)
        }

        const members = await prisma.member.findMany({
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            invoices: {
              select: {
                status: true,
              }
            },
          },
          where: {
            clubId: club.id,
          },
          orderBy: {
            role: 'asc',
          },
        })
        const membersWithRoles = members.map(
          ({ user: { id: userId, ...user }, invoices, ...member }) => {
            return {
              ...user,
              ...member,
              userId,
              overdue: invoices.some(i => i.status === 'OVERDUE'),
            }
          }
        )

        return reply.send({ members: membersWithRoles })
      }
    )
}
