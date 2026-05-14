'use server'

import { createRace } from '@/http/create-race'
import { createRaceResult } from '@/http/create-race-result'
import { revalidatePath } from 'next/cache'

export async function createRaceAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const distance = Number(formData.get('distance'))
  const city = formData.get('city') as string
  const dateStr = formData.get('date') as string
  const imageUrl = formData.get('imageUrl') as string
  const routeData = formData.get('routeData') as string

  try {
    await createRace({
      slug,
      name,
      distance,
      city,
      date: new Date(dateStr),
      imageUrl: imageUrl || null,
      routeData: routeData ? JSON.parse(routeData) : null,
    })

    revalidatePath(`/${slug}/races`)

    return { success: true, message: 'Prova criada com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao criar a prova.' }
  }
}

export async function createRaceResultAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const raceId = formData.get('raceId') as string
  const timeStr = formData.get('time') as string // HH:MM:SS
  const position = formData.get('position') ? Number(formData.get('position')) : null

  // Convert HH:MM:SS to seconds
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  try {
    await createRaceResult({
      slug,
      raceId,
      time: totalSeconds,
      position,
    })

    revalidatePath(`/${slug}/races`)
    revalidatePath(`/${slug}/races/${raceId}`)

    return { success: true, message: 'Resultado registrado com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao registrar o resultado.' }
  }
}
