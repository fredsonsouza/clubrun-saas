import { app } from '@/http/server'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Create Club (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new club', async () => {
    const { token, user } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .post('/clubs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Macuxi Runner',
        domain: 'macuxirunner.com.br',
        description: 'Clube de corrida de Roraima',
      })

    expect(response.statusCode).toBe(201)

    // Verifica se o clube foi criado no banco
    const club = await prisma.club.findUnique({
      where: { slug: 'macuxi-runner' },
    })

    expect(club).not.toBeNull()
    expect(club?.name).toBe('Macuxi Runner')

    const membership = await prisma.member.findFirst({
      where: {
        userId: user.id,
        clubId: club?.id,
      },
    })

    expect(membership?.role).toBe('OWNER')
  })
})
