import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { createSlug } from '@/utils/create-slug'

export async function createClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Create a new club',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            cnpj: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            201: z.object({
              clubId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { name, domain, shouldAttachUsersByDomain, cnpj } = request.body

        if (domain) {
          const culbByDomain = await prisma.club.findUnique({
            where: { domain },
          })

          if (culbByDomain) {
            throw new BadRequestError(
              'Another club with same domain already exists!'
            )
          }
        }
        const club = await prisma.club.create({
          data: {
            name,
            slug: createSlug(name),
            domain,
            cnpj,
            shouldAttachUsersByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'OWNER',
              },
            },
          },
        })

        return reply.status(201).send({
          clubId: club.id,
        })
      }
    )
}
