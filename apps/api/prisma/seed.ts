import 'dotenv/config'
import { z } from 'zod'
import { pool, prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/utils/identity'

const seedAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).optional(),
  name: z.string().optional(),
})

async function seed() {
  console.log('🌱 Iniciando verificação de seed/bootstrap do banco de dados ClubRun...')

  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD
  const seedAdminUsername = process.env.SEED_ADMIN_USERNAME || 'adminclubrun'
  const seedAdminName = process.env.SEED_ADMIN_NAME || 'Administrador ClubRun'

  if (!seedAdminEmail || !seedAdminPassword) {
    console.log(
      'ℹ️ Bootstrap de administrador ignorado: variáveis SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD não definidas.'
    )
    return
  }

  const adminCredentials = seedAdminSchema.safeParse({
    email: seedAdminEmail,
    password: seedAdminPassword,
    username: seedAdminUsername,
    name: seedAdminName,
  })

  if (!adminCredentials.success) {
    throw new Error(
      'SEED_ADMIN_EMAIL deve ser um e-mail válido e SEED_ADMIN_PASSWORD deve ter no mínimo 8 caracteres.'
    )
  }

  const { email, password, username, name } = adminCredentials.data

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (existingUser) {
    console.log(
      `ℹ️ Usuário existente preservado sem alterações: ${existingUser.email} (${existingUser.username})`
    )
    if (!existingUser.isSystemAdmin) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          isSystemAdmin: true,
          emailVerifiedAt: new Date(),
        },
      })
      console.log('✅ Permissões de Super Admin concedidas ao usuário existente!')
    }
    return
  }

  const passwordHash = await hashPassword(password)

  const adminUser = await prisma.user.create({
    data: {
      email,
      name,
      username,
      avatarUrl: 'https://github.com/fredsonsouza.png',
      passwordHash,
      isSystemAdmin: true,
      emailVerifiedAt: new Date(),
    },
  })

  console.log(`✅ Usuário administrador criado com sucesso: ${adminUser.email}`)
}

seed()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (error) => {
    console.error('❌ Erro ao executar o seed:', error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
