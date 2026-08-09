import { mutationApi } from './api-client'

export async function setRaceRegistration({
  slug,
  raceId,
  isRegistered,
}: {
  slug: string
  raceId: string
  isRegistered: boolean
}) {
  const endpoint = `clubs/${slug}/races/${raceId}/participants/me`

  if (isRegistered) {
    await mutationApi.put(endpoint)
  } else {
    await mutationApi.delete(endpoint)
  }

  return {
    isRegistered,
    message: isRegistered
      ? 'Inscrição realizada com sucesso!'
      : 'Inscrição cancelada com sucesso!',
  }
}
