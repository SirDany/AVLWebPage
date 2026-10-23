import { afterEach, describe, expect, it, vi } from 'vitest'
import { allowSubscription, subscribe } from '../src/lib/newsletter'
import { isHTTPS, isVideoID, validateSlug } from '../src/lib/validation'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Newsletter consent and delivery', () => {
  it('invalid or unconfigured submissions fail and provider acceptance succeeds', async () => {
    await expect(subscribe({ email: 'wrong', consent: true })).rejects.toMatchObject({
      status: 400,
    })
    await expect(subscribe({ email: 'artist@example.test', consent: false })).rejects.toMatchObject(
      { status: 400 },
    )
    vi.stubEnv('MAILERLITE_API_KEY', '')
    await expect(subscribe({ email: 'artist@example.test', consent: true })).rejects.toMatchObject({
      status: 503,
    })
    vi.stubEnv('MAILERLITE_API_KEY', 'test-provider-key')
    vi.stubEnv('MAILERLITE_GROUP_ID', '123')
    vi.stubEnv('NEWSLETTER_DOUBLE_OPT_IN_CONFIRMED', 'true')
    let outgoing: Record<string, unknown> = {}
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      outgoing = JSON.parse(String(init.body))
      return Response.json({ data: { id: '1', status: 'unconfirmed' } }, { status: 201 })
    })
    const result = await subscribe({ email: ' Artist@Example.test ', consent: true })
    expect(result.message).toContain('Check the inbox')
    expect(outgoing).toEqual({ email: 'artist@example.test', groups: ['123'] })
  })

  it.each([429, 500, 401])(
    'provider rejection %s never appears as a successful subscription',
    async (status) => {
      vi.stubEnv('MAILERLITE_API_KEY', 'test-provider-key')
      vi.stubEnv('MAILERLITE_GROUP_ID', '123')
      vi.stubEnv('NEWSLETTER_DOUBLE_OPT_IN_CONFIRMED', 'true')
      vi.stubGlobal('fetch', async () => Response.json({ message: 'Provider error' }, { status }))
      await expect(
        subscribe({ email: 'artist@example.test', consent: true }),
      ).rejects.toMatchObject({ status: status === 429 ? 429 : 502 })
    },
  )

  it('repeated subscription attempts are blocked until the rate window expires', () => {
    for (let index = 0; index < 5; index++) expect(allowSubscription('test-ip', 1000)).toBe(true)
    expect(allowSubscription('test-ip', 1000)).toBe(false)
    expect(allowSubscription('test-ip', 1000 + 15 * 60 * 1000)).toBe(true)
  })
})

describe('Safe project resources', () => {
  it.each([
    'javascript:alert(1)',
    'http://example.com',
    'https://name:secret@example.com',
    'not a URL',
  ])('rejects unsafe external resource %s', (url) => {
    expect(isHTTPS(url)).toBe(false)
  })
  it('accepts ordinary HTTPS links, stable slugs, and YouTube identifiers', () => {
    expect(isHTTPS('https://example.com/material')).toBe(true)
    expect(validateSlug('the-oracle')).toBe(true)
    expect(validateSlug('../draft')).not.toBe(true)
    expect(isVideoID('abcdefghijk')).toBe(true)
    expect(isVideoID('https://youtube.com/watch?v=abcdefghijk')).toBe(false)
  })
})
