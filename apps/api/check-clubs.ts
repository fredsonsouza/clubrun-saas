import { prisma } from './src/lib/prisma'


async function main() {
  const clubs = await prisma.club.findMany({
    select: { name: true, slug: true }
  })
  console.log(JSON.stringify(clubs, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
