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
  await prisma.workout.deleteMany()
  await prisma.member.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.club.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('123456', 6)

  console.log('Creating super admin...')
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Clubrun',
      email: 'admin@clubrun.com',
      avatarUrl: 'https://github.com/fredsonsouza.png',
      passwordHash,
    },
  })

  console.log('Creating users pool...')
  const users = []
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        avatarUrl: `https://i.pravatar.cc/150?u=${faker.string.uuid()}`,
        passwordHash,
        athleteProfile: {
          create: {
            bio: faker.lorem.sentence(),
            city: 'Boa Vista',
            paceAvg: faker.number.float({ min: 4, max: 7, fractionDigits: 2 }),
            weight: faker.number.int({ min: 60, max: 90 }),
            height: faker.number.int({ min: 160, max: 195 }),
          },
        },
      },
    })
    users.push(user)
  }

  const clubNames = [
    { name: 'Corre Macuxi', slug: 'corre-macuxi' },
    { name: 'Jabuti do Lavrado', slug: 'jabuti-do-lavrado' },
    { name: 'Tamo no Pace', slug: 'tamo-no-pace' },
    { name: 'Elite Run', slug: 'elite-run' },
    { name: 'Pé no Asfalto', slug: 'pe-no-asfalto' },
  ]

  console.log('Creating clubs and assignments...')
  // --- FIX: Usar for...of simples para evitar erro de iteração entries() ---
  let index = 0
  for (const clubData of clubNames) {
    const clubUsers = users.slice(index * 10, (index + 1) * 10)
    
    const club = await prisma.club.create({
      data: {
        name: clubData.name,
        slug: clubData.slug,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${clubData.slug}`,
        ownerId: adminUser.id,
        members: {
          create: [
            // Admin Master é ADMIN em todos os clubes
            {
              userId: adminUser.id,
              role: 'ADMIN' as any,
            },
            // 10 participantes por clube
            ...clubUsers.map((u, idx) => ({
              userId: u.id,
              role: (idx === 0 ? 'COACH' : idx === 1 ? 'MANAGER' : 'MEMBER') as any,
            })),
          ],
        },
      },
    })

    for (const user of [adminUser, ...clubUsers]) {
      await prisma.workout.createMany({
        data: Array.from({ length: 3 }).map(() => ({
          athleteId: user.id,
          clubId: club.id,
          title: faker.helpers.arrayElement([
            'Rodagem Leve',
            'Treino de Tiros',
            'Longão de Domingo',
            'Tempo Run',
            'Recuperativo',
          ]),
          distance: faker.number.float({ min: 5, max: 21, fractionDigits: 2 }),
          duration: faker.number.int({ min: 1800, max: 7200 }),
          type: faker.helpers.arrayElement([
            'EASY',
            'INTERVAL',
            'TEMPO',
            'LONG',
            'RECOVERY',
          ]) as any,
          date: faker.date.recent({ days: 15 }),
        })),
      })
    }
    index++
  }

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
