import { getPayload } from 'payload'
import config from '@payload-config'
import { allowSubscription, NewsletterError, subscribe } from '@/lib/newsletter'
import { createHash } from 'node:crypto'

export async function POST(request: Request) {
  if (
    request.headers.get('origin') !==
    new URL(process.env.SITE_URL || 'http://localhost:3000').origin
  ) {
    return Response.json({ error: 'This request origin is not allowed.' }, { status: 403 })
  }
  const ip =
    process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') || 'unknown' : 'local'
  const key = createHash('sha256').update(ip).digest('hex')
  if (!allowSubscription(key))
    return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  const text = await request.text()
  if (text.length > 2048)
    return Response.json({ error: 'The request is too large.' }, { status: 413 })
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return Response.json({ error: 'A valid JSON request is required.' }, { status: 400 })
  }
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
  if (!settings.newsletterEnabled || !settings.privacyNotice) {
    return Response.json(
      { error: 'Newsletter subscriptions are not available yet.' },
      { status: 503 },
    )
  }
  try {
    return Response.json(await subscribe(data), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof NewsletterError)
      return Response.json({ error: error.message }, { status: error.status })
    throw error
  }
}
