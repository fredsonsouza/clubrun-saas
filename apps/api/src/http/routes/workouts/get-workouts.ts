import { getUserPermissions } from '@/utils/get-user-permissions'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function getWorkouts(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/clubs/:slug/workouts',
    {
      schema: {
        tags: ['workouts'],
        summary: 'Get all club workouts',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            workouts: z.array(
              z.object({
                title: z.string().nullable(),
                distance: z.number(),
                duration: z.number().int().nullable(),
                pace: z.number().nullable(),
                type: z.string(),
                date: z.coerce.date(),
                notes: z.string().nullable(),
                imageUrl: z.string().nullable(),
                createdAt: z.date(),
                clubId: z.uuid(),
                athlete: z.object({
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
    async (request, reply) => {
      const { slug } = request.params
      const userId = await request.getCurrentUserId()
      const { club, memberShip } = await request.getUserMemberShip(slug)

      const { cannot } = getUserPermissions(userId, memberShip.role)

      if (cannot('get', 'Workout')) {
        throw new UnauthorizedError(`You're not allowed to see club workouts`)
      }

      const workouts = await prisma.workout.findMany({
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
      })

      return reply.send({ workouts })
    }
  )
}
