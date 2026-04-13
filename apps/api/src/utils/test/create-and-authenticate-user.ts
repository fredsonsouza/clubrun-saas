import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'

export async function createAndAuthenticateUser(app: FastifyInstance) {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: await hash('123456', 6),
    },
  })

  // Geramos o token nativamente, muito mais rápido e sem depender da rota HTTP de login
  const token = (app as any).jwt.sign({ sub: user.id })

  return { token, user }
}
