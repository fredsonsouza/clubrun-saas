import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { PrismaClient } from '../generated/prisma/client'

declare const process: any

const SEED_CONFIRMATION = 'DELETE_ALL_DATA'

function getSeedConfiguration() {
  const environment = process.env.NODE_ENV

  if (environment !== 'development' && environment !== 'test') {
    throw new Error('Seed is only allowed in development or test environments.')
  }

  if (process.env.SEED_CONFIRMATION !== SEED_CONFIRMATION) {
    throw new Error(
      `Refusing to seed without SEED_CONFIRMATION=${SEED_CONFIRMATION}.`
    )
  }

  const password = process.env.SEED_ADMIN_PASSWORD
  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD is required to run the seed.')
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the seed.')
  }

  return { databaseUrl, password }
}

async function seed() {
  const { databaseUrl, password } = getSeedConfiguration()
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Cleaning database...')
    await prisma.auditLog.deleteMany()
    await prisma.ranking.deleteMany()
    await prisma.workout.deleteMany()
    await prisma.raceResult.deleteMany()
    await prisma.race.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.member.deleteMany()
    await prisma.invite.deleteMany()
    await prisma.account.deleteMany()
    await prisma.token.deleteMany()
    await prisma.athleteProfile.deleteMany()
    await prisma.club.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await hash(password, 6)

    console.log('Creating super admin...')
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@clubrun.com',
        username: 'adminclubrun',
        avatarUrl: 'https://github.com/fredsonsouza.png',
        passwordHash,
        isSystemAdmin: true,
      },
    })

    console.log('Seed complete!')
  } finally {
    await prisma.$disconnect()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
