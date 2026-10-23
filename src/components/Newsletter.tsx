'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

export function Newsletter({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ message: string; error: boolean } | null>(null)
  if (!enabled) return null
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setResult(null)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          website: data.get('website'),
          consent: data.get('consent') === 'on',
        }),
      })
      const body: { error?: string; message?: string } = await response.json()
      if (!response.ok) throw new Error(body.error || 'The subscription could not be completed.')
      setResult({ message: body.message || 'Request received.', error: false })
      form.reset()
    } catch (error) {
      setResult({
        message:
          error instanceof Error
            ? error.message
            : 'The service is unavailable. Please try again later.',
        error: true,
      })
    } finally {
      setPending(false)
    }
  }
  return (
    <section className="newsletter section-pad" aria-labelledby="newsletter-title">
      <div>
        <h2 id="newsletter-title">Studio updates</h2>
        <p>New work and journal entries, by email.</p>
      </div>
      <form onSubmit={submit} className="newsletter-form">
        <label htmlFor="newsletter-email">Email address</label>
        <div className="email-field">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            placeholder="Email address"
          />
          <button disabled={pending} type="submit" aria-label="Subscribe to studio updates">
            {pending ? 'Sending…' : 'Subscribe ↗'}
          </button>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <label className="consent">
          <input name="consent" type="checkbox" required />
          <span>
            Email updates are welcome. See the <Link href="/privacy">privacy notice</Link>.
            Unsubscribe at any time.
          </span>
        </label>
        {result && (
          <p
            role={result.error ? 'alert' : 'status'}
            className={result.error ? 'form-error' : 'form-success'}
          >
            {result.message}
          </p>
        )}
      </form>
    </section>
  )
}
