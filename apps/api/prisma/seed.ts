import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

// --- FIX: Definir process corretamente para evitar erros de tipagem ---
declare const process: any

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function seed() {
  console.log('Cleaning database...')
  await prisma.ranking.deleteMany()
  await prisma.workout.deleteMany()
  await prisma.member.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.club.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('#admin.entrar1', 6)

  console.log('Creating super admin...')
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@clubrun.com',
      avatarUrl: 'https://github.com/fredsonsouza.png',
      passwordHash,
      isSystemAdmin: true,
    },
  })

  console.log('Seed complete!')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
