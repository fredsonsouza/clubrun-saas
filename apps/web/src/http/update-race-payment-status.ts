import { mutationApi } from './api-client'

interface UpdateRacePaymentStatusRequest {
  slug: string
  raceId: string
  athleteId: string
  paymentStatus: 'PENDING' | 'CONFIRMED'
}

export async function updateRacePaymentStatus({
  slug,
  raceId,
  athleteId,
  paymentStatus,
}: UpdateRacePaymentStatusRequest) {
  const result = await mutationApi
    .patch(`clubs/${slug}/races/${raceId}/participants/${athleteId}/payment`, {
      json: {
        paymentStatus,
      },
    })
    .json<{ message: string }>()

  return result
}
