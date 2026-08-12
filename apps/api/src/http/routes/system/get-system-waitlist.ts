import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function getSystemWaitlist(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/system/waitlist',
      {
        schema: {
          tags: ['system'],
          summary: 'Get all waitlist registrations (Admin only)',
          security: [{ bearerAuth: [] }],
          querystring: z.object({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(50),
          }),
          response: {
            200: z.object({
              waitlist: z.array(
                z.object({
                  id: z.string().uuid(),
                  email: z.string().email(),
                  name: z.string().nullable(),
                  createdAt: z.date(),
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
          throw new ForbiddenError(
            'Only system administrators can access this.'
          )
        }

        const { page, limit } = request.query
        const skip = (page - 1) * limit

        const [waitlist, totalCount] = await Promise.all([
          prisma.waitlist.findMany({
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: limit,
          }),
          prisma.waitlist.count(),
        ])

        const totalPages = Math.ceil(totalCount / limit)

        return reply.send({ waitlist, totalPages })
      }
    )
}
