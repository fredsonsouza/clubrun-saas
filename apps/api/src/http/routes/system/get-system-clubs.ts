import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function getSystemClubs(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/system/clubs',
      {
        schema: {
          tags: ['system'],
          summary: 'Get all clubs in the platform',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              clubs: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  createdAt: z.date(),
                  owner: z.object({
                    name: z.string().nullable(),
                    email: z.string(),
                  }),
                  _count: z.object({
                    members: z.number(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user?.isSystemAdmin) {
          throw new ForbiddenError(
            'Only system administrators can access this.'
          )
        }

        const clubs = await prisma.club.findMany({
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return reply.send({ clubs })
      }
    )
}
