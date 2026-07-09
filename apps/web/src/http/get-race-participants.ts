import { api } from './api-client'

export interface Participant {
  id: string
  createdAt: string
  paymentStatus: 'PENDING' | 'CONFIRMED' | null
  athlete: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

interface GetRaceParticipantsResponse {
  participants: Participant[]
}

export async function getRaceParticipants(slug: string, raceId: string) {
  const result = await api
    .get(`clubs/${slug}/races/${raceId}/participants`, {
      next: {
        tags: [`race-participants:${raceId}`],
      },
    })
    .json<GetRaceParticipantsResponse>()

  return result
}
