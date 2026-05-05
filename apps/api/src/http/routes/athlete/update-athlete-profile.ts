import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

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
            birthDate: z.coerce.date().optional(),
            gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
            bio: z.string().max(500).optional(),
            city: z.string().optional(),
            instagramUrl: z.string().nullable().optional(), // Changed from z.url() to z.string() to be more flexible
            youtubeUrl: z.string().nullable().optional(),
            stravaUrl: z.string().nullable().optional(),
            isPublic: z.boolean().optional(),
          }),
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { name, avatarUrl, ...athleteData } = request.body

        // Update User info if provided
        if (name || avatarUrl !== undefined) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              ...(name && { name }),
              ...(avatarUrl !== undefined && { avatarUrl }),
            },
          })
        }

        const profile = await prisma.athleteProfile.update({
          where: {
            userId,
          },
          data: athleteData,
        })

        return reply.send({ profile })
      }
    )
}
