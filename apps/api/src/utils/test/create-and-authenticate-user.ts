import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  email?: string
) {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: email ?? `johndoe-${randomUUID()}@example.com`,
      passwordHash: await hash('123456', 6),
    },
  })

  // Geramos o token nativamente, muito mais rápido e sem depender da rota HTTP de login
  const token = (app as any).jwt.sign({ sub: user.id })

  return { token, user }
}
