import { api } from './api-client'

interface JoinWaitlistRequest {
  email: string
  name?: string
}

interface SubmitFeedbackRequest {
  type: 'BUG' | 'SUGGESTION' | 'OTHER'
  comment: string
}

interface GetFeedbacksResponse {
  feedbacks: {
    id: string
    type: string
    comment: string
    createdAt: string
    user: {
      name: string | null
      email: string
    }
  }[]
  totalPages: number
}

// Rota pública para Lista de Espera
export async function joinWaitlist({ email, name }: JoinWaitlistRequest) {
  const result = await api
    .post('waitlist', {
      json: { email, name: name || undefined },
    })
    .json<{ message: string }>()

  return result
}

// Rota autenticada para Feedback
export async function submitFeedback({ type, comment }: SubmitFeedbackRequest) {
  const result = await api
    .post('feedbacks', {
      json: { type, comment },
    })
    .json<{ message: string }>()

  return result
}

// Rota administrativa para ler feedbacks (apenas Super Admin)
export async function getSystemFeedbacks({
  page = 1,
  limit = 20,
}: { page?: number; limit?: number } = {}) {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(page))
  searchParams.set('limit', String(limit))

  const result = await api
    .get('system/feedbacks', { searchParams })
    .json<GetFeedbacksResponse>()

  return result
}

interface GetWaitlistResponse {
  waitlist: {
    id: string
    email: string
    name: string | null
    createdAt: string
  }[]
  totalPages: number
}

// Rota administrativa para ler lista de espera (apenas Super Admin)
export async function getSystemWaitlist({
  page = 1,
  limit = 20,
}: { page?: number; limit?: number } = {}) {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(page))
  searchParams.set('limit', String(limit))

  const result = await api
    .get('system/waitlist', { searchParams })
    .json<GetWaitlistResponse>()

  return result
}
