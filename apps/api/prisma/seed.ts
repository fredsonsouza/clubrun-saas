import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

declare var process: {
  env: {
    DATABASE_URL: string
    [key: string]: string | undefined
  }
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

const prisma = new PrismaClient({ adapter })

async function seed() {
  await prisma.club.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('123456', 6)

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@acme.com',
      avatarUrl: 'https://github.com/fredsonsouza.png',
      passwordHash,
    },
  })

  const anotherUser = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  })

  const anotherUser2 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  })

  await prisma.club.create({
    data: {
      name: 'Acme Inc (Admin)',
      domain: 'acme.com',
      slug: 'acme-admin',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      workouts: {
        createMany: {
          data: [
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser2.id,
              role: 'COACH',
            },
          ],
        },
      },
    },
  })

  await prisma.club.create({
    data: {
      name: 'Acme Inc (Billing)',
      slug: 'acme-billing',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      workouts: {
        createMany: {
          data: [
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'BILLING',
            },
            {
              userId: anotherUser.id,
              role: 'OWNER',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.club.create({
    data: {
      name: 'Acme Inc (Member)',
      slug: 'acme-member',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      workouts: {
        createMany: {
          data: [
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
            {
              athleteId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              date: faker.date.anytime().toISOString(),
              distance: faker.number.float(),
              type: faker.helpers.arrayElement(['long', 'easy', 'interval']),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })
}
seed().then(() => {
  console.log('Database seeded!')
})
