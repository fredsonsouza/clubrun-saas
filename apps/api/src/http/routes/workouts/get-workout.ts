import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/workouts/:workoutSlug',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Get workout details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            workoutSlug: z.string(),
          }),
          response: {
            200: z.object({
              workout: z.object({
                id: z.uuid(),
                title: z.string().nullable(),
                distance: z.number(),
                duration: z.number().nullable(),
                pace: z.number().nullable(),
                type: z.string(),
                status: z.enum(['PLANNED', 'COMPLETED']),
                assignmentMode: z.enum(['GOAL', 'FREE']).nullable(),
                date: z.coerce.date(),
                notes: z.string().nullable(),
                imageUrl: z.string().nullable(),
                clubId: z.uuid(),
                athlete: z.object({
                  id: z.uuid(),
                  name: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                }),
                createdAt: z.coerce.date(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutSlug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(
          userId, 
          memberShip.role, 
          memberShip.isSystemAdmin,
          memberShip.clubId
        )

        if (cannot('get', 'Workout')) {
          throw new UnauthorizedError(`You're not allowed to see this workout`)
        }

        const workout = await prisma.workout.findFirst({
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
            status: true,
            assignmentMode: true,
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
            slug: workoutSlug,
            clubId: club.id,
          },
        })

        if (!workout) {
          throw new BadRequestError('Workout not found!')
        }
        return reply.send({ workout })
      }
    )
}
