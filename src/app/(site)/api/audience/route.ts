import { getPayload } from 'payload'
import config from '@payload-config'
import { NewsletterError, providerRequest } from '@/lib/newsletter'

async function authorized(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  return Boolean(user)
}

function failure(error: unknown) {
  if (error instanceof NewsletterError)
    return Response.json({ error: error.message }, { status: error.status })
  throw error
}

export async function GET(request: Request) {
  if (!(await authorized(request)))
    return Response.json({ error: 'Administrator login required.' }, { status: 401 })
  const group = process.env.MAILERLITE_GROUP_ID
  if (!group || !/^\d+$/.test(group)) {
    return Response.json({ error: 'A valid newsletter group is not configured.' }, { status: 503 })
  }
  const cursor = new URL(request.url).searchParams.get('cursor')
  if (cursor && (cursor.length > 2048 || !/^[\w=+/-]+$/.test(cursor))) {
    return Response.json({ error: 'Invalid page cursor.' }, { status: 400 })
  }
  try {
    const response = await providerRequest(
      `groups/${group}/subscribers?limit=25${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
    )
    const data = (await response.json()) as {
      data: { id: string; email: string; status: string }[]
      meta?: { next_cursor?: string | null }
    }
    return Response.json(
      {
        subscribers: data.data.map(({ id, email, status }) => ({ id, email, status })),
        nextCursor: data.meta?.next_cursor || null,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: Request) {
  if (
    request.headers.get('origin') !==
    new URL(process.env.SITE_URL || 'http://localhost:3000').origin
  ) {
    return Response.json({ error: 'This request origin is not allowed.' }, { status: 403 })
  }
  if (!(await authorized(request)))
    return Response.json({ error: 'Administrator login required.' }, { status: 401 })
  const text = await request.text()
  if (text.length > 1024)
    return Response.json({ error: 'The request is too large.' }, { status: 413 })
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  if (
    !data ||
    typeof data !== 'object' ||
    !('id' in data) ||
    typeof data.id !== 'string' ||
    !/^\d{1,30}$/.test(data.id)
  ) {
    return Response.json({ error: 'A valid subscriber identifier is required.' }, { status: 400 })
  }
  try {
    await providerRequest(`subscribers/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'unsubscribed' }),
    })
    return Response.json(
      { message: 'Address unsubscribed.' },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return failure(error)
  }
}
