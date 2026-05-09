import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const club = await prisma.club.findUnique({
    where: { slug: 'elite-run' }
  })
  console.log(JSON.stringify(club, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
