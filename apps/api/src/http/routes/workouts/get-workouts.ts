import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getWorkouts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/workouts',
      {
        schema: {
          tags: ['Workouts'],
          summary: 'Get club workouts',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            page: z.coerce.number().min(1).default(1),
            limit: z.coerce.number().min(1).max(50).default(20),
          }),
          response: {
            200: z.object({
              workouts: z.array(
                z.object({
                  id: z.uuid(),
                  title: z.string().nullable(),
                  slug: z.string().nullable(),
                  distance: z.number(),
                  duration: z.number().int().nullable(),
                  pace: z.number().nullable(),
                  type: z.string(),
                  date: z.coerce.date(),
                  notes: z.string().nullable(),
                  imageUrl: z.string().nullable(),
                  createdAt: z.coerce.date(),
                  clubId: z.uuid(),
                  athlete: z.object({
                    id: z.string(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                }),
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
        const { slug } = request.params
        const { page, limit } = request.query
        const skip = (page - 1) * limit
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { can } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        if (!can('get', 'Workout')) {
          throw new UnauthorizedError(`You're not allowed to list workouts`)
        }

        const [total, workouts] = await Promise.all([
          prisma.workout.count({
            where: { clubId: club.id },
          }),
          prisma.workout.findMany({
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              clubId: true,
              distance: true,
              duration: true,
              pace: true,
              type: true,
              date: true,
              notes: true,
              createdAt: true,
              athlete: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
            where: {
              clubId: club.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            skip,
          }),
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
      },
    )
}
