import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { createAuditLog } from '@/utils/audit-log'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        summary: 'Create a new account',
        tags: ['auth'],
        body: z.object({
          name: z.string(),
          username: z.string().min(3).regex(/^[a-zA-Z0-9._-]+$/),
          email: z.email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, username, email, password } = request.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail) {
        throw new BadRequestError('User with same e-mail already exists!')
      }

      const userWithSameUsername = await prisma.user.findUnique({
        where: { username },
      })

      if (userWithSameUsername) {
        throw new BadRequestError('Username already taken!')
      }

      const [, domain] = email.split('@')

      const autoJoinClub = await prisma.club.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      const passwordHash = await hash(password, 6)

      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          passwordHash,
          athleteProfile: {
            create: {
              isPublic: true,
            },
          },
          members_on: autoJoinClub
            ? {
                create: {
                  clubId: autoJoinClub.id,
                },
              }
            : undefined,
        },
      })

      await createAuditLog({
        userId: user.id,
        action: 'CREATE_ACCOUNT',
        entity: 'USER',
        entityId: user.id,
        payload: { email: user.email, username: user.username },
      })

      return reply.status(201).send()
    }
  )
}
