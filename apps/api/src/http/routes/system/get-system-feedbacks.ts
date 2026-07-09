import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getSystemFeedbacks(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/system/feedbacks',
      {
        schema: {
          tags: ['system'],
          summary: 'Get all system feedbacks (Admin only)',
          security: [{ bearerAuth: [] }],
          querystring: z.object({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(50),
          }),
          response: {
            200: z.object({
              feedbacks: z.array(
                z.object({
                  id: z.string().uuid(),
                  type: z.string(),
                  comment: z.string(),
                  createdAt: z.date(),
                  user: z.object({
                    name: z.string().nullable(),
                    email: z.string(),
                  }),
                })
              ),
              totalPages: z.number(),
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
          throw new UnauthorizedError(
            'Only system administrators can access this.'
          )
        }

        const { page, limit } = request.query
        const skip = (page - 1) * limit

        const [feedbacks, totalCount] = await Promise.all([
          prisma.systemFeedback.findMany({
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: limit,
          }),
          prisma.systemFeedback.count(),
        ])

        const totalPages = Math.ceil(totalCount / limit)

        return reply.send({ feedbacks, totalPages })
      }
    )
}
