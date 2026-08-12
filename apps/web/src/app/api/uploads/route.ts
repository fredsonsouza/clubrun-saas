import { getSessionToken } from '@/auth/cookies'
import { mutationApi } from '@/http/api-client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const uploadSchema = z.object({
  file: z.instanceof(File),
})

export async function POST(request: Request) {
  if (!(await getSessionToken())) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const parsed = uploadSchema.safeParse({ file: formData.get('file') })

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Arquivo inválido.' },
        { status: 400 }
      )
    }

    const upstreamResponse = await mutationApi.post('uploads', {
      body: formData,
      throwHttpErrors: false,
    })
    const body = await upstreamResponse.text()

    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: {
        'content-type':
          upstreamResponse.headers.get('content-type') ?? 'application/json',
        'cache-control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível enviar o arquivo.' },
      { status: 502 }
    )
  }
}
