import { prisma } from '../src/lib/prisma'
import { updateAthleteRanking } from '../src/services/update-athlete-ranking'

async function run() {
  console.log('Reprocessando os rankings dos atletas com base nos treinos concluídos...')

  // Limpar a tabela de rankings atual para recriar do zero com as chaves corretas
  await prisma.ranking.deleteMany()
  console.log('Tabela de rankings limpa.')

  const completedWorkouts = await prisma.workout.findMany({
    where: {
      status: 'COMPLETED',
    },
    select: {
      athleteId: true,
      clubId: true,
      date: true,
    }
  })

  console.log(`Encontrados ${completedWorkouts.length} treinos concluídos. Reprocessando...`)

  for (const w of completedWorkouts) {
    if (w.clubId) {
      await updateAthleteRanking(w.athleteId, w.clubId, new Date(w.date))
      console.log(`Rankings atualizados para o atleta ${w.athleteId} no clube ${w.clubId} para a data ${w.date}`)
    }
  }

  console.log('Processo de reprocessamento concluído com sucesso!')
}

run()
