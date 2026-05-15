import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getMyWorkouts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
    '/workouts/me',
    {
      schema: {
        tags: ['workouts'],
        summary: 'Get workouts',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(50).default(20),
          status: z.enum(['PLANNED', 'COMPLETED']).default('COMPLETED'),
        }),
        response: {
          200: z.object({
            workouts: z.array(
              z.object({
                id: z.uuid(),
                title: z.string().nullable(),
                distance: z.number().nullable(),
                duration: z.number().nullable(),
                pace: z.number().nullable(),
                type: z.string(),
                status: z.enum(['PLANNED', 'COMPLETED']),
                assignmentMode: z.enum(['GOAL', 'FREE']).nullable(),
                date: z.coerce.date(),
                notes: z.string().nullable(),
                clubId: z.uuid(),
                club: z.object({
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().nullable(),
                }),
                createdAt: z.coerce.date(),
              })
            ),
            meta: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const { page, limit, status } = request.query

      const skip = (page - 1) * limit

      const where = {
        athleteId: userId,
        status,
      }

      const [total, workouts] = await Promise.all([
        prisma.workout.count({ where }),
        prisma.workout.findMany({
          where,
          include: {
            club: { select: { name: true, slug: true, avatarUrl: true } },
          },
          orderBy: { date: 'desc' },
          take: limit,
          skip: skip,
        })
      ])

      return reply.send({
        workouts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    }
  )
}
