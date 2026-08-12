import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { faker } from '@faker-js/faker'
import {
  getISOWeek,
  getMonth,
  getYear,
  startOfISOWeek,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Get Club Ranking (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get club monthly ranking', async () => {
    const { token, user, club } = await createAndAuthenticateUser(
      app,
      'ATHLETE'
    )

    if (!club) throw new Error('Test club was not created')

    const year = getYear(new Date())
    const month = getMonth(new Date()) + 1

    // Cria alguns rankings para o clube
    await prisma.ranking.createMany({
      data: [
        {
          clubId: club.id,
          athleteId: user.id,
          periodType: 'MONTH',
          periodStart: startOfMonth(new Date(year, month - 1, 1)),
          points: 100,
        },
        {
          clubId: club.id,
          athleteId: (
            await prisma.user.create({
              data: { name: 'Other Athlete', email: faker.internet.email() },
            })
          ).id,
          periodType: 'MONTH',
          periodStart: startOfMonth(new Date(year, month - 1, 1)),
          points: 200,
        },
      ],
    })

    const response = await request(app.server)
      .get(`/clubs/${club?.slug}/rankings`)
      .set('Authorization', `Bearer ${token}`)
      .query({ type: 'monthly', year, month })

    expect(response.statusCode).toBe(200)
    expect(response.body.rankings).toHaveLength(2)
    expect(response.body.rankings[0].points).toBe(200) // Ordem decrescente
    expect(response.body.rankings[1].points).toBe(100)
    expect(response.body.rankings[0].athlete.name).toBe('Other Athlete')
  })

  it('should be able to get club weekly ranking', async () => {
    const { token, user, club } = await createAndAuthenticateUser(
      app,
      'ATHLETE'
    )

    if (!club) throw new Error('Test club was not created')

    const year = getYear(new Date())
    const week = getISOWeek(new Date())

    await prisma.ranking.create({
      data: {
        clubId: club.id,
        athleteId: user.id,
        periodType: 'WEEK',
        periodStart: startOfISOWeek(new Date()),
        points: 50,
      },
    })

    const response = await request(app.server)
      .get(`/clubs/${club?.slug}/rankings`)
      .set('Authorization', `Bearer ${token}`)
      .query({ type: 'weekly', year, week })

    expect(response.statusCode).toBe(200)
    expect(response.body.rankings).toHaveLength(1)
    expect(response.body.rankings[0].points).toBe(50)
  })

  it('should be able to get club yearly ranking', async () => {
    const { token, user, club } = await createAndAuthenticateUser(
      app,
      'ATHLETE'
    )

    if (!club) throw new Error('Test club was not created')

    const year = 2024

    await prisma.ranking.create({
      data: {
        clubId: club.id,
        athleteId: user.id,
        periodType: 'YEAR',
        periodStart: startOfYear(new Date(year, 0, 1)),
        points: 500,
      },
    })

    const response = await request(app.server)
      .get(`/clubs/${club?.slug}/rankings`)
      .set('Authorization', `Bearer ${token}`)
      .query({ type: 'yearly', year })

    expect(response.statusCode).toBe(200)
    expect(response.body.rankings).toHaveLength(1)
    expect(response.body.rankings[0].points).toBe(500)
  })

  it('should not be able to get ranking if user is not a member', async () => {
    const { token } = await createAndAuthenticateUser(app)

    // Cria um clube onde o usuário NÃO é membro
    const club = await prisma.club.create({
      data: {
        name: faker.company.name(),
        slug: faker.string.uuid(),
        ownerId: (
          await prisma.user.create({
            data: { name: 'Owner', email: faker.internet.email() },
          })
        ).id,
      },
    })

    const response = await request(app.server)
      .get(`/clubs/${club.slug}/rankings`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(401)
  })
})
