import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with e-mail & password',
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const useFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!useFromEmail) {
        throw new BadRequestError('Invalid credentials')
      }

      if (useFromEmail.passwordHash === null) {
        throw new BadRequestError(
          'User does not have a password, use social login'
        )
      }

      const isPasswordValid = await compare(password, useFromEmail.passwordHash)

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials')
      }

      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: useFromEmail.id,
            expiresIn: '7d',
          },
        }
      )
      return reply.status(201).send({ token })
    }
  )
}
