import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { createAuditLog } from '@/utils/audit-log'

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
            duration: z.number().nullable().optional(),
            pace: z.number().optional(),
            athleteId: z.string().uuid().optional(),
            status: z.enum(['PLANNED', 'COMPLETED']).default('COMPLETED'),
            assignmentMode: z.enum(['GOAL', 'FREE']).optional(),
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

        const { cannot } = getUserPermissions(
          userId, 
          memberShip.role, 
          memberShip.isSystemAdmin,
          memberShip.clubId
        )

        const { title, distance, duration, date, pace, type, notes, athleteId, status, assignmentMode } =
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
            status: isPrescribing ? 'PLANNED' : status,
            assignmentMode: isPrescribing ? (assignmentMode || 'FREE') : null,
            slug: `${createSlug(title)}-${Date.now()}`,
            clubId: club.id,
            athleteId: targetAthleteId,
          },
        })

        // Update AthleteProfile and Ranking ONLY if workout is COMPLETED
        if (workout.status === 'COMPLETED') {
          const { updateAthleteRanking } = await import('@/services/update-athlete-ranking')
          
          await updateAthleteRanking(targetAthleteId, club.id, date)

          const athleteStats = await prisma.workout.aggregate({
            where: {
              athleteId: targetAthleteId,
              clubId: club.id,
              status: 'COMPLETED',
            },
            _sum: {
              distance: true,
              duration: true,
            },
          })

          if (athleteStats._sum.distance && athleteStats._sum.duration) {
            const totalDistance = athleteStats._sum.distance
            const totalSeconds = athleteStats._sum.duration
            const newPaceAvg = (totalSeconds / 60) / totalDistance

            await prisma.athleteProfile.upsert({
              where: { userId: targetAthleteId },
              create: {
                userId: targetAthleteId,
                paceAvg: newPaceAvg,
              },
              update: {
                paceAvg: newPaceAvg,
              },
            })
          }
        }

        await createAuditLog({
          action: 'WORKOUT_CREATED',
          entity: 'WORKOUT',
          entityId: workout.id,
          userId,
          payload: { clubId: club.id, distance: workout.distance, athleteId: targetAthleteId },
        })

        return reply.status(201).send({
          workoutId: workout.id,
        })
      }
    )
}
