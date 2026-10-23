export class NewsletterError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

export function newsletterConfigured() {
  return Boolean(
    process.env.MAILERLITE_API_KEY &&
    process.env.MAILERLITE_GROUP_ID &&
    process.env.NEWSLETTER_DOUBLE_OPT_IN_CONFIRMED === 'true',
  )
}

export function validSubscription(
  value: unknown,
): value is { email: string; consent: true; website?: string } {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return (
    typeof data.email === 'string' &&
    data.email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) &&
    data.consent === true &&
    (!data.website || typeof data.website === 'string')
  )
}

export async function providerRequest(path: string, init?: RequestInit) {
  if (!process.env.MAILERLITE_API_KEY)
    throw new NewsletterError('Newsletter service is not configured.', 503)
  let response: Response
  try {
    response = await fetch(`https://connect.mailerlite.com/api/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
  } catch (error) {
    console.error(
      'Newsletter provider connection failed:',
      error instanceof Error ? error.name : 'Unknown error',
    )
    throw new NewsletterError('The newsletter service is unavailable. Please try again later.', 502)
  }
  if (!response.ok) {
    console.error('Newsletter provider rejected request:', response.status)
    throw new NewsletterError(
      response.status === 429
        ? 'The newsletter service is busy. Please try again later.'
        : 'The newsletter request could not be completed.',
      response.status === 429 ? 429 : 502,
    )
  }
  return response
}

export async function subscribe(data: unknown) {
  if (!validSubscription(data))
    throw new NewsletterError('Enter a valid email address and accept the privacy notice.', 400)
  if (data.website) throw new NewsletterError('This submission could not be accepted.', 400)
  if (!newsletterConfigured())
    throw new NewsletterError('Newsletter subscriptions are not available yet.', 503)
  await providerRequest('subscribers', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email.trim().toLowerCase(),
      groups: [process.env.MAILERLITE_GROUP_ID],
    }),
  })
  return {
    message:
      'Request received. Check the inbox for confirmation if this address is not already subscribed.',
  }
}

const attempts = new Map<string, { count: number; expires: number }>()
export function allowSubscription(key: string, now = Date.now()) {
  for (const [id, attempt] of attempts) if (attempt.expires <= now) attempts.delete(id)
  const attempt = attempts.get(key)
  if (attempt) {
    if (attempt.count >= 5) return false
    attempt.count++
  } else {
    if (attempts.size >= 5000) return false
    attempts.set(key, { count: 1, expires: now + 15 * 60 * 1000 })
  }
  return true
}
