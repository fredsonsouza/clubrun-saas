import { app } from '../src/http/server'
import { prisma } from '../src/lib/prisma'

async function test() {
  await app.ready()

  const athleteId = 'ab86cff4-a5a5-41d5-8129-aa0571a5e3bb' // Lucas Cal
  const token = app.jwt.sign({ sub: athleteId })

  const response = await app.inject({
    method: 'GET',
    url: '/clubs/corre-macuxi/rankings',
    query: {
      type: 'monthly',
    },
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  console.log('STATUS:', response.statusCode)
  console.log('BODY:', JSON.stringify(JSON.parse(response.body), null, 2))

  await app.close()
}

test()
