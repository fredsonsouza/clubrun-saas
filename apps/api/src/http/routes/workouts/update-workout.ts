import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
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
            distance: z.number(),
            duration: z.number().nullable(),
            pace: z.number().nullable(),
            type: z.enum(WorkoutType),
            date: z.coerce.date().optional(),
            routeData: z.any().optional(),
          }),
          params: z.object({
            slug: z.string(),
            workoutId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const userId = await request.getCurrentUserId()
        const { memberShip, club } = await request.getUserMemberShip(slug)

        const workout = await prisma.workout.findUnique({
          where: {
            id: workoutId,
            clubId: club.id,
          },
        })

        if (!workout) {
          throw new BadRequestError('Workout not found!')
        }

        const authWorkout = workoutSchema.parse(workout)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId ?? club.id,
          club.ownerId
        )

        if (cannot('update', authWorkout)) {
          throw new ForbiddenError(`You're not allowed to update this workout`)
        }

        const { title, distance, duration, pace, type, date, routeData } =
          request.body

        // Logic for Rescheduling and Lead Time
        let updatedRescheduleCount = workout.rescheduleCount
        if (
          date &&
          new Date(date).getTime() !== new Date(workout.date).getTime()
        ) {
          // Check limit: 3 reschedules
          if (workout.rescheduleCount >= 3) {
            throw new BadRequestError(
              'Você já atingiu o limite máximo de 3 reagendamentos para este treino. Por favor, entre em contato com seu treinador.'
            )
          }

          // Rule: 2h Lead Time if moving to today or if today is the day
          const now = new Date()
          const newDate = new Date(date)

          const isTodayTarget =
            now.getFullYear() === newDate.getFullYear() &&
            now.getMonth() === newDate.getMonth() &&
            now.getDate() === newDate.getDate()

          if (isTodayTarget) {
            const twoHoursInMs = 2 * 60 * 60 * 1000
            if (newDate.getTime() - now.getTime() < twoHoursInMs) {
              throw new BadRequestError(
                'Reagendamentos para o mesmo dia devem ser feitos com no mínimo 2h de antecedência do novo horário.'
              )
            }
          }

          updatedRescheduleCount += 1
        }

        const oldDistance = workout.distance
        const distanceDifference = distance - oldDistance

        if (workout.status === 'COMPLETED' && workout.shoesUsed) {
          const athleteProfile = await prisma.athleteProfile.findUnique({
            where: { userId: workout.athleteId },
            select: {
              shoes: true,
              shoesRemainingDistance: true,
            },
          })

          if (athleteProfile && athleteProfile.shoes === workout.shoesUsed) {
            if (
              athleteProfile.shoesRemainingDistance !== null &&
              athleteProfile.shoesRemainingDistance !== undefined
            ) {
              if (distanceDifference > athleteProfile.shoesRemainingDistance) {
                throw new BadRequestError(
                  `A alteração excede a vida útil restante do seu tênis (${athleteProfile.shoesRemainingDistance.toFixed(1)} km). O máximo permitido para este ajuste é +${athleteProfile.shoesRemainingDistance.toFixed(1)} km.`
                )
              }
            }

            // Ajusta o restante do calçado
            await prisma.athleteProfile.update({
              where: { userId: workout.athleteId },
              data: {
                shoesRemainingDistance: {
                  decrement: distanceDifference,
                },
              },
            })
          }
        }

        await prisma.workout.update({
          where: {
            id: workoutId,
          },
          data: {
            title,
            distance,
            duration,
            pace,
            type,
            date,
            routeData,
            rescheduleCount: updatedRescheduleCount,
          },
        })

        // Update AthleteProfile paceAvg
        const athleteStats = await prisma.workout.aggregate({
          where: {
            athleteId: workout.athleteId,
            clubId: club.id,
          },
          _sum: {
            distance: true,
            duration: true,
          },
        })

        if (athleteStats._sum.distance && athleteStats._sum.duration) {
          const totalDistance = athleteStats._sum.distance
          const totalSeconds = athleteStats._sum.duration
          const newPaceAvg = totalSeconds / 60 / totalDistance

          await prisma.athleteProfile.upsert({
            where: { userId: workout.athleteId },
            create: {
              userId: workout.athleteId,
              paceAvg: newPaceAvg,
            },
            update: {
              paceAvg: newPaceAvg,
            },
          })
        }

        return reply.status(204).send(null)
      }
    )
}
