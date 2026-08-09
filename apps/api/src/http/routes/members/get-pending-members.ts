import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { persistedRoleSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function getPendingMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/members/pending',
      {
        schema: {
          tags: ['members'],
          summary: 'Get club pending members requests',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.uuid(),
                  role: persistedRoleSchema,
                  status: z.literal('PENDING'),
                  user: z.object({
                    id: z.uuid(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        if (club.ownerId !== userId && !memberShip.isSystemAdmin) {
          throw new ForbiddenError(
            'Only the club owner can view pending member requests.'
          )
        }

        const members = await prisma.member.findMany({
          where: {
            clubId: club.id,
            status: 'PENDING',
          },
          select: {
            id: true,
            role: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        })

        return {
          members: members.map((member) => ({
            ...member,
            status: 'PENDING' as const,
          })),
        }
      }
    )
}
