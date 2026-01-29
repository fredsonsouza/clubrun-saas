import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        summary: 'Create a new account',
        tags: ['auth'],
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userWithSaneEmail = await prisma.user.findUnique({
        where: { email },
      })

      const [, domain] = email.split('@')

      const autoJoinClub = await prisma.club.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      if (userWithSaneEmail) {
        throw new BadRequestError('User with same e-mail already exists!')
      }

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          members_on: autoJoinClub
            ? {
                create: {
                  clubId: autoJoinClub.id,
                },
              }
            : undefined,
        },
      })

      return reply.status(201).send()
    }
  )
}
