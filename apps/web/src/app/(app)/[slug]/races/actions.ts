'use server'

import { createRace } from '@/http/create-race'
import { createRaceResult } from '@/http/create-race-result'
import { deleteRace } from '@/http/delete-race'
import { updateRace } from '@/http/update-race'
import { updateRacePaymentStatus } from '@/http/update-race-payment-status'
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

export async function updateRaceAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const raceId = formData.get('raceId') as string
  const name = formData.get('name') as string
  const distance = Number(formData.get('distance'))
  const city = formData.get('city') as string
  const dateStr = formData.get('date') as string
  const imageUrl = formData.get('imageUrl') as string
  const routeData = formData.get('routeData') as string

  try {
    await updateRace(slug, raceId, {
      name,
      distance,
      city,
      date: new Date(dateStr).toISOString(),
      imageUrl: imageUrl || null,
      routeData: routeData ? JSON.parse(routeData) : null,
    })

    revalidatePath(`/${slug}/races`)
    revalidatePath(`/${slug}/races/${raceId}`)

    return { success: true, message: 'Prova atualizada com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao atualizar a prova.' }
  }
}

export async function deleteRaceAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const raceId = formData.get('raceId') as string

  try {
    await deleteRace(slug, raceId)

    revalidatePath(`/${slug}/races`)

    return { success: true, message: 'Prova excluída com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao excluir a prova.' }
  }
}

export async function createRaceResultAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const raceId = formData.get('raceId') as string
  const timeStr = formData.get('time') as string // HH:MM:SS
  const position = formData.get('position')
    ? Number(formData.get('position'))
    : null

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

export async function updateRacePaymentStatusAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const raceId = formData.get('raceId') as string
  const athleteId = formData.get('athleteId') as string
  const paymentStatus = formData.get('paymentStatus') as 'PENDING' | 'CONFIRMED'

  try {
    await updateRacePaymentStatus({
      slug,
      raceId,
      athleteId,
      paymentStatus,
    })

    revalidatePath(`/${slug}/races`)
    revalidatePath(`/${slug}/races/${raceId}`)

    return { success: true, message: 'Status de pagamento atualizado!' }
  } catch (err) {
    return { success: false, message: 'Erro ao atualizar status de pagamento.' }
  }
}
