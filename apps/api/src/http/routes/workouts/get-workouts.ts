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
          response: {
            200: z.object({
              workouts: z.array(z.any()),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { can } = getUserPermissions(userId, memberShip.role)

        if (!can('get', 'Workout')) {
          throw new UnauthorizedError(`You're not allowed to list workouts`)
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
      },
    )
}
