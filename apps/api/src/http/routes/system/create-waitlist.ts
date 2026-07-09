import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function createWaitlist(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/waitlist',
    {
      schema: {
        tags: ['system'],
        summary: 'Join waitlist for launching',
        body: z.object({
          email: z.string().email(),
          name: z.string().optional(),
        }),
        response: {
          201: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, name } = request.body

      const existing = await prisma.waitlist.findUnique({
        where: { email },
      })

      if (!existing) {
        await prisma.waitlist.create({
          data: { email, name },
        })
      }

      return reply.status(201).send({
        message: 'Inscrição na lista de espera realizada com sucesso!',
      })
    }
  )
}
