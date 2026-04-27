import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/workouts',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Create a new workout',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string(),
            distance: z.number(),
            duration: z.number().int(),
            pace: z.number(),
            athleteId: z.string().uuid().optional(),
            type: z.enum([
              'EASY',
              'INTERVAL',
              'TEMPO',
              'LONG',
              'RECOVERY',
              'RACE',
              'STRENGTH',
              'WALK',
            ]),
            date: z.coerce.date(),
            notes: z.string().nullish(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              workoutId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot, can } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        const { title, distance, duration, date, pace, type, notes, athleteId } =
          request.body

        // If target athlete is different from creator, check if can prescribe
        const targetAthleteId = athleteId || userId
        const isPrescribing = targetAthleteId !== userId

        if (isPrescribing && cannot('prescribe', 'Workout')) {
          throw new UnauthorizedError(
            `You're not allowed to prescribe workouts to other athletes`
          )
        }

        if (!isPrescribing && cannot('create', 'Workout')) {
          throw new UnauthorizedError(
            `You're not allowed to create new workouts`
          )
        }

        const workout = await prisma.workout.create({
          data: {
            title,
            distance,
            duration,
            date,
            pace,
            type,
            notes,
            slug: `${createSlug(title)}-${Date.now()}`,
            clubId: club.id,
            athleteId: targetAthleteId,
          },
        })

        return reply.status(201).send({
          workoutId: workout.id,
        })
      }
    )
}
