import { prisma } from './src/lib/prisma'

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'e6e2f88b-1de0-4f4f-af3d-c54ea1e7702c' },
    select: { id: true, email: true, emailVerifiedAt: true },
  })
  console.log('USER_CHECK:', JSON.stringify(user, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
