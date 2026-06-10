import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { subDays } from 'date-fns'

export async function getUserProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users/:userId/profile',
      {
        schema: {
          tags: ['users'],
          summary: 'Get user profile by ID',
          security: [{ bearerAuth: [] }],
          params: z.object({
            userId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                name: z.string().nullable(),
                email: z.string(),
                avatarUrl: z.string().nullable(),
                isSystemAdmin: z.boolean(),
              }),
              athleteProfile: z.object({
                bio: z.string().nullable().optional(),
                city: z.string().nullable().optional(),
                paceAvg: z.number().nullable().optional(),
                weight: z.number().nullable().optional(),
                height: z.number().nullable().optional(),
                gender: z.any().nullable().optional(),
                birthDate: z.any().nullable().optional(),
                instagramUrl: z.string().nullable().optional(),
                stravaUrl: z.string().nullable().optional(),
                coverUrl: z.string().nullable().optional(),
                shoes: z.string().nullable().optional(),
                shoesMaxDistance: z.number().nullable().optional(),
                shoesRemainingDistance: z.number().nullable().optional(),
                watch: z.string().nullable().optional(),
                hasMedicalConditions: z.boolean().optional(),
                medicalConditions: z.string().nullable().optional(),
                isPremium: z.boolean().optional(),
                isStravaConnected: z.boolean().optional(),
              }).nullable(),
              stats: z.object({
                avgPace: z.number().optional(),
                totalDistance: z.number().optional(),
                totalWorkouts: z.number().optional(),
              }),
              workouts: z.array(z.any()),
              plannedWorkouts: z.array(z.any()),
            }),
          },
        },
      },
      async (request, reply) => {
        const { userId: profileUserId } = request.params
        const currentUserId = await request.getCurrentUserId()
        const isOwner = currentUserId === profileUserId
        
        console.log(`[DEBUG] Buscando perfil do usuário: ${profileUserId} (Solicitado por: ${currentUserId})`)

        const user = await prisma.user.findUnique({
          where: { id: profileUserId },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isSystemAdmin: true,
            clubsOwned: {
              select: { id: true }
            },
            members_on: {
              select: { role: true }
            },
            athleteProfile: {
              select: {
                bio: true,
                city: true,
                paceAvg: true,
                weight: true,
                height: true,
                gender: true,
                birthDate: true,
                instagramUrl: true,
                stravaUrl: true,
                coverUrl: true,
                shoes: true,
                shoesMaxDistance: true,
                shoesRemainingDistance: true,
                watch: true,
                hasMedicalConditions: true,
                medicalConditions: true,
                stravaAthleteId: true,
                isPremium: true,
              }
            },
          },
        })

        if (!user) {
          console.error(`[ERROR] Usuário não encontrado no banco: ${profileUserId}`)
          throw new BadRequestError('User not found')
        }

        // Calculate stats for the last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30)

        const workoutsStats = await prisma.workout.aggregate({
          where: {
            athleteId: profileUserId,
            status: 'COMPLETED',
            date: {
              gte: thirtyDaysAgo,
            },
          },
          _sum: {
            distance: true,
            duration: true,
          },
          _count: {
            id: true,
          },
        })

        const totalDistance = workoutsStats._sum.distance || 0
        const totalDuration = workoutsStats._sum.duration || 0
        const totalWorkouts = workoutsStats._count.id || 0
        
        // Pace is in minutes per km
        const avgPace = totalDistance > 0 ? totalDuration / totalDistance : 0

        const workouts = await prisma.workout.findMany({
          where: {
            athleteId: profileUserId,
            status: 'COMPLETED',
          },
          include: {
            club: {
              select: {
                name: true,
                slug: true,
              }
            },
            reactions: {
              select: {
                type: true,
                userId: true,
              }
            }
          },
          orderBy: {
            date: 'desc',
          },
          take: 20,
        })

        const plannedWorkouts = isOwner ? await prisma.workout.findMany({
          where: {
            athleteId: profileUserId,
            status: 'PLANNED',
          },
          include: {
            club: {
              select: {
                name: true,
                slug: true,
              }
            },
            reactions: {
              select: {
                type: true,
                userId: true,
              }
            }
          },
          orderBy: {
            date: 'asc',
          },
        }) : []

        const formatReactions = (wList: any[]) => {
          return wList.map((workout) => {
            const reactionCounts: Record<string, number> = {}
            let currentUserReaction: string | null = null

            workout.reactions?.forEach((reaction: any) => {
              reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1
              if (reaction.userId === currentUserId) {
                currentUserReaction = reaction.type
              }
            })

            const formattedReactions = Object.entries(reactionCounts).map(([type, count]) => ({
              type,
              count,
            }))

            const { reactions: _, ...rest } = workout

            return {
              ...rest,
              reactions: formattedReactions,
              currentUserReaction,
            }
          })
        }

        const isClubAdmin = user.clubsOwned.length > 0 || user.members_on.some(m => ['OWNER', 'COACH', 'MANAGER', 'ADMIN'].includes(m.role))
        const isPremium = isClubAdmin || user.isSystemAdmin || user.athleteProfile?.isPremium || false

        return reply.send({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            isSystemAdmin: user.isSystemAdmin,
          },
          athleteProfile: user.athleteProfile ? {
            bio: user.athleteProfile.bio,
            city: user.athleteProfile.city,
            paceAvg: user.athleteProfile.paceAvg,
            weight: user.athleteProfile.weight,
            height: user.athleteProfile.height,
            gender: user.athleteProfile.gender,
            birthDate: user.athleteProfile.birthDate,
            instagramUrl: user.athleteProfile.instagramUrl,
            stravaUrl: user.athleteProfile.stravaUrl,
            coverUrl: user.athleteProfile.coverUrl,
            shoes: user.athleteProfile.shoes,
            shoesMaxDistance: user.athleteProfile.shoesMaxDistance,
            shoesRemainingDistance: user.athleteProfile.shoesRemainingDistance,
            watch: user.athleteProfile.watch,
            hasMedicalConditions: isOwner || user.isSystemAdmin ? user.athleteProfile.hasMedicalConditions : false,
            medicalConditions: isOwner || user.isSystemAdmin ? user.athleteProfile.medicalConditions : null,
            isPremium,
            isStravaConnected: !!user.athleteProfile.stravaAthleteId,
          } : null,
          stats: {
            avgPace,
            totalDistance,
            totalWorkouts,
          },
          workouts: formatReactions(workouts),
          plannedWorkouts: formatReactions(plannedWorkouts),
        })
      }
    )
}
