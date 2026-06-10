import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '@/http/routes/_errors/forbidden-error'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'

export async function updateAthleteProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/profile/athlete',
      {
        schema: {
          tags: ['athlete'],
          summary: 'Update athlete physical and training profile',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().optional(),
            avatarUrl: z.string().url().nullable().optional(),
            weight: z.number().positive().optional(),
            height: z.number().int().positive().optional(),
            birthDate: z.coerce.date(),
            gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
            bio: z.string().max(500).optional(),
            city: z.string().optional(),
            instagramUrl: z.string().nullable().optional(),
            youtubeUrl: z.string().nullable().optional(),
            stravaUrl: z.string().nullable().optional(),
            coverUrl: z.string().url().nullable().optional(),
            isPublic: z.boolean().optional(),
            shoes: z.string().nullable().optional(),
            shoesMaxDistance: z.number().positive().nullable().optional(),
            watch: z.string().nullable().optional(),
            hasMedicalConditions: z.boolean().optional(),
            medicalConditions: z.string().max(1000).nullable().optional(),
          }),
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { name, avatarUrl, ...athleteData } = request.body

        // 1. Buscar informações de assinatura e dados do usuário/perfil no banco
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            isSystemAdmin: true,
            clubsOwned: { select: { id: true } },
            members_on: { select: { role: true } },
            athleteProfile: {
              select: {
                isPremium: true,
                bio: true,
                gender: true,
                weight: true,
                height: true,
                instagramUrl: true,
                youtubeUrl: true,
                stravaUrl: true,
                coverUrl: true,
                isPublic: true,
                shoes: true,
                shoesMaxDistance: true,
                shoesRemainingDistance: true,
                watch: true,
                hasMedicalConditions: true,
                medicalConditions: true,
              }
            }
          }
        })

        if (!user) {
          throw new BadRequestError('Usuário não encontrado.')
        }

        const isClubAdmin = user.clubsOwned.length > 0 || user.members_on.some(m => ['OWNER', 'COACH', 'MANAGER', 'ADMIN'].includes(m.role))
        const isPremium = isClubAdmin || user.isSystemAdmin || user.athleteProfile?.isPremium || false

        // 2. Se não for premium, barrar qualquer tentativa de alteração de campos restritos
        if (!isPremium) {
          if (name !== undefined && name !== user.name) {
            throw new ForbiddenError('Edição de nome completo é um recurso exclusivo para Atletas Premium.')
          }

          const profile = user.athleteProfile
          const hasChanged = (newValue: any, oldValue: any) => {
            if (newValue === undefined) return false
            const normNew = newValue === null ? '' : String(newValue)
            const normOld = oldValue === null ? '' : String(oldValue)
            return normNew !== normOld
          }

          if (
            hasChanged(athleteData.bio, profile?.bio) ||
            hasChanged(athleteData.gender, profile?.gender) ||
            hasChanged(athleteData.weight, profile?.weight) ||
            hasChanged(athleteData.height, profile?.height) ||
            hasChanged(athleteData.instagramUrl, profile?.instagramUrl) ||
            hasChanged(athleteData.youtubeUrl, profile?.youtubeUrl) ||
            hasChanged(athleteData.stravaUrl, profile?.stravaUrl) ||
            hasChanged(athleteData.coverUrl, profile?.coverUrl) ||
            hasChanged(athleteData.shoes, profile?.shoes) ||
            hasChanged(athleteData.shoesMaxDistance, profile?.shoesMaxDistance) ||
            hasChanged(athleteData.watch, profile?.watch) ||
            (athleteData.isPublic !== undefined && athleteData.isPublic !== profile?.isPublic) ||
            (athleteData.hasMedicalConditions !== undefined && athleteData.hasMedicalConditions !== profile?.hasMedicalConditions) ||
            hasChanged(athleteData.medicalConditions, profile?.medicalConditions)
          ) {
            throw new ForbiddenError('Você tentou alterar campos avançados do perfil que são exclusivos para Atletas Premium.')
          }
        }

        // 3. Lógica e validação de quilometragem de tênis (vida útil)
        let finalShoesMax = user.athleteProfile?.shoesMaxDistance
        let finalShoesRemaining = user.athleteProfile?.shoesRemainingDistance

        if (athleteData.shoes !== undefined || athleteData.shoesMaxDistance !== undefined) {
          const newShoes = athleteData.shoes !== undefined ? athleteData.shoes : user.athleteProfile?.shoes
          const newMax = athleteData.shoesMaxDistance !== undefined ? athleteData.shoesMaxDistance : user.athleteProfile?.shoesMaxDistance

          if (newShoes && (newMax === undefined || newMax === null || newMax <= 0)) {
            throw new BadRequestError('Ao informar um tênis, você deve passar uma quilometragem de uso recomendada pelo fabricante maior que zero.')
          }

          if (!newShoes) {
            finalShoesMax = null
            finalShoesRemaining = null
          } else {
            const oldShoesName = user.athleteProfile?.shoes
            const oldShoesMax = user.athleteProfile?.shoesMaxDistance

            // Se mudou o tênis ou não tinha antes
            if (!oldShoesName || oldShoesName !== newShoes) {
              finalShoesMax = newMax
              finalShoesRemaining = newMax
            }
            // Se manteve o tênis mas mudou o max
            else if (newMax !== undefined && newMax !== null && oldShoesMax !== null && oldShoesMax !== undefined && newMax !== oldShoesMax) {
              finalShoesMax = newMax
              const difference = newMax - oldShoesMax
              finalShoesRemaining = (user.athleteProfile?.shoesRemainingDistance ?? 0) + difference
            }
          }
        }

        // 4. Atualizar dados do usuário se fornecidos
        if (name || avatarUrl !== undefined) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              ...(name && { name }),
              ...(avatarUrl !== undefined && { avatarUrl }),
            },
          })
        }

        // 5. Atualizar o perfil do atleta
        const profile = await prisma.athleteProfile.update({
          where: {
            userId,
          },
          data: {
            ...athleteData,
            shoesMaxDistance: finalShoesMax,
            shoesRemainingDistance: finalShoesRemaining,
          },
        })

        return reply.send({ profile })
      }
    )
}
