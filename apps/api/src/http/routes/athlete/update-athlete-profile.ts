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
            weight: z.number().positive().optional(),
            height: z.number().int().positive().optional(),
            birthDate: z.coerce.date().optional(),
            gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
            bio: z.string().max(500).optional(),
            city: z.string().optional(),
            instagramUrl: z.url().nullable().optional(),
            youtubeUrl: z.url().nullable().optional(),
            stravaUrl: z.url().nullable().optional(),
            isPublic: z.boolean().optional(),
          }),
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const data = request.body

        const profile = await prisma.athleteProfile.update({
          where: {
            userId,
          },
          data,
        })

        return reply.send({ profile })
      }
    )
}
