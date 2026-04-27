import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Create Workout (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register a new workout', async () => {
    const { token, user, club } = await createAndAuthenticateUser(app, 'MEMBER')

    const title = faker.lorem.words(3)
    const distance = faker.number.float({ min: 1, max: 50, fractionDigits: 2 })
    const duration = faker.number.int({ min: 300, max: 18000 })
    const pace = faker.number.float({ min: 3, max: 10, fractionDigits: 2 })
    const type = faker.helpers.arrayElement([
      'EASY',
      'INTERVAL',
      'LONG',
    ])
    const notes = faker.lorem.sentence()
    const date = new Date().toISOString()

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/workouts`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title,
        notes,
        distance,
        duration,
        pace,
        type,
        date,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('workoutId')

    const workout = await prisma.workout.findFirst({
      where: {
        id: response.body.workoutId,
      },
    })

    expect(workout).not.toBeNull()
    expect(workout).toMatchObject({
      title,
      notes,
      distance,
      duration,
      pace,
      type,
      clubId: club?.id,
      athleteId: user.id,
    })
  })

  it('should not be able to register a workout in a club without being a member', async () => {
    const { token } = await createAndAuthenticateUser(app) // Usuário sem clube

    // Tentativa de postar em um slug aleatório
    const response = await request(app.server)
      .post('/clubs/clube-inexistente/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: faker.lorem.words(2),
        distance: 3000,
        duration: 900,
        pace: 5.0,
        type: 'EASY',
        date: new Date().toISOString(),
      })

    expect(response.statusCode).toBe(401)
  })

  it('should not be able to register a workout with invalid data', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'MEMBER')

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/workouts`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: faker.lorem.words(1),
        distance: 'invalid', // Deveria ser número
        duration: -100, // Deveria ser positivo
        date: 'invalid-date',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Validation error')
  })

  it('should not be able to register a workout with unauthorized role (BILLING)', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'BILLING')

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/workouts`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: faker.lorem.words(3),
        distance: 5,
        duration: 1500,
        pace: 5.0,
        type: 'EASY',
        date: new Date().toISOString(),
      })

    expect(response.statusCode).toBe(401)
  })
})
