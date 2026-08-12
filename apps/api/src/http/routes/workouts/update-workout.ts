import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import {
  creditShoesOnce,
  debitShoesOnce,
} from '@/services/shoes-mileage-ledger'
import {
  updateAthletePaceAverage,
  updateAthleteRanking,
} from '@/services/update-athlete-ranking'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { workoutSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { WorkoutType } from '../../../../generated/prisma/enums'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function updateWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug/workouts/:workoutId',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Update a workout',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string().nullable(),
            distance: z.number().finite().positive().max(500),
            duration: z.number().finite().positive().nullable(),
            pace: z.number().finite().positive().nullable().optional(),
            type: z.enum(WorkoutType),
            date: z.coerce.date().optional(),
            routeData: z.json().optional(),
            version: z.number().int().nonnegative().optional(),
          }),
          params: z.object({ slug: z.string(), workoutId: z.string() }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const userId = await request.getCurrentUserId()
        const { memberShip, club } = await request.getUserMemberShip(slug)
        const workout = await prisma.workout.findUnique({
          where: { id: workoutId, clubId: club.id },
        })
        if (!workout) throw new BadRequestError('Workout not found!')

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId ?? club.id,
          club.ownerId
        )
        if (cannot('update', workoutSchema.parse(workout))) {
          throw new ForbiddenError(`You're not allowed to update this workout`)
        }

        const { title, distance, duration, type, date, routeData, version } =
          request.body
        const updatedDate = date ?? workout.date
        const updatedPace =
          workout.status === 'COMPLETED' && duration
            ? duration / 60 / distance
            : null
        const rescheduleCount =
          date && date.getTime() !== workout.date.getTime()
            ? workout.rescheduleCount + 1
            : workout.rescheduleCount
        if (rescheduleCount > 3) {
          throw new BadRequestError('Limite máximo de reagendamentos atingido.')
        }

        await prisma.$transaction(async (tx) => {
          const updated = await tx.workout.updateMany({
            where: {
              id: workoutId,
              clubId: club.id,
              version: version ?? workout.version,
            },
            data: {
              title,
              distance,
              duration,
              pace: updatedPace,
              type,
              date: updatedDate,
              routeData: routeData ?? undefined,
              rescheduleCount,
              version: { increment: 1 },
            },
          })
          if (updated.count !== 1) {
            throw new BadRequestError(
              'Treino foi alterado por outra requisição.'
            )
          }

          if (workout.status === 'COMPLETED' && workout.shoesUsed) {
            const difference = distance - workout.distance
            const profile = await tx.athleteProfile.findUnique({
              where: { userId: workout.athleteId },
              select: { shoes: true, shoesRemainingDistance: true },
            })
            if (profile?.shoes === workout.shoesUsed && difference !== 0) {
              if (difference > 0) {
                await debitShoesOnce(tx, {
                  athleteId: workout.athleteId,
                  sourceType: 'WORKOUT_ADJUSTMENT',
                  sourceId: `${workout.id}:${version ?? workout.version}:debit`,
                  distanceKm: difference,
                })
              } else {
                await creditShoesOnce(tx, {
                  athleteId: workout.athleteId,
                  sourceType: 'WORKOUT_ADJUSTMENT',
                  sourceId: `${workout.id}:${version ?? workout.version}:debit`,
                  distanceKm: -difference,
                })
              }
            }
          }

          if (workout.status === 'COMPLETED') {
            await updateAthletePaceAverage(tx, workout.athleteId, club.id)
            await updateAthleteRanking(
              tx,
              workout.athleteId,
              club.id,
              workout.date
            )
            if (updatedDate.getTime() !== workout.date.getTime()) {
              await updateAthleteRanking(
                tx,
                workout.athleteId,
                club.id,
                updatedDate
              )
            }
          }
        })

        return reply.status(204).send(null)
      }
    )
}
