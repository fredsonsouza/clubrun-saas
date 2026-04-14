import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { faker } from '@faker-js/faker'
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

    const name = `${faker.company.name()} - ${Math.random()}`
    const domain = `${faker.internet.domainName()}-${Math.random()}`
    const cnpj = faker.string.numeric(14)

    const response = await request(app.server)
      .post('/clubs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name,
        domain,
        cnpj,
        shouldAttachUsersByDomain: true,
      })

    if (response.statusCode !== 201) {
      console.error(response.body)
    }

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('clubId')

    const club = await prisma.club.findUnique({
      where: { id: response.body.clubId },
    })

    expect(club).not.toBeNull()
    expect(club).toMatchObject({
      name,
      domain,
      cnpj,
    })

    const membership = await prisma.member.findFirst({
      where: {
        userId: user.id,
        clubId: club?.id,
      },
    })

    expect(membership?.role).toBe('OWNER')
  })

  it('should not be able to create a new club if already belongs to an active club', async () => {
    // createAndAuthenticateUser(app, 'MEMBER') cria um usuário já vinculado a um clube
    const { token } = await createAndAuthenticateUser(app, 'MEMBER')

    const response = await request(app.server)
      .post('/clubs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `${faker.company.name()} - ${Math.random()}`,
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Member already belongs to an active club.')
  })

  it('should not be able to create a club with a duplicate domain', async () => {
    const { token: token1 } = await createAndAuthenticateUser(app)
    const domain = `${faker.internet.domainName()}-${Math.random()}`

    // Cria o primeiro clube
    await request(app.server)
      .post('/clubs')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: `${faker.company.name()} - ${Math.random()}`,
        domain,
      })

    const { token: token2 } = await createAndAuthenticateUser(app)

    // Tenta criar o segundo clube com o mesmo domínio
    const response = await request(app.server)
      .post('/clubs')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        name: `${faker.company.name()} - ${Math.random()}`,
        domain,
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe(
      'Another club with same domain already exists!'
    )
  })

  it('should not be able to create a club with invalid data', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .post('/clubs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '', // Nome vazio pode falhar se o schema proibir string vazia
        shouldAttachUsersByDomain: 'not-a-boolean',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Validation error')
  })
})
