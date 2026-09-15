import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { hashPassword, normalizeEmail, passwordSchema } from '../src/utils/identity'

async function createAdmin() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to create admin.')
  }

  const name = process.env.ADMIN_NAME || 'Super Admin'
  const email = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@clubrun.com')
  const username = process.env.ADMIN_USERNAME || 'adminclubrun'
  const password = process.env.ADMIN_PASSWORD || 'Admin123456!'

  passwordSchema.parse(password)
  const passwordHash = await hashPassword(password)

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existing) {
      console.log(`[ADMIN] Usuário existente (${existing.email}). Atualizando para Super Admin...`)
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          isSystemAdmin: true,
          emailVerifiedAt: new Date(),
          passwordHash,
        },
      })
      console.log(`[ADMIN] Administrador atualizado com sucesso!`)
      console.log(`E-mail: ${existing.email}`)
      console.log(`Username: ${existing.username}`)
    } else {
      console.log(`[ADMIN] Criando novo Super Admin (${email})...`)
      const created = await prisma.user.create({
        data: {
          name,
          email,
          username,
          avatarUrl: 'https://github.com/fredsonsouza.png',
          passwordHash,
          isSystemAdmin: true,
          emailVerifiedAt: new Date(),
        },
      })
      console.log(`[ADMIN] Administrador criado com sucesso!`)
      console.log(`E-mail: ${created.email}`)
      console.log(`Username: ${created.username}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin().catch((err) => {
  console.error('[ADMIN ERROR]', err)
  process.exit(1)
})
