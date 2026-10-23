'use client'

import { useState } from 'react'

type Subscriber = { id: string; email: string; status: string }
type AudienceResponse = { subscribers?: Subscriber[]; nextCursor?: string | null; error?: string }

export function Audience() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  async function load(cursor?: string) {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(
        '/api/audience' + (cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''),
      )
      const data: AudienceResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'The audience could not be loaded.')
      setSubscribers(data.subscribers || [])
      setNextCursor(data.nextCursor || null)
      setMessage(data.subscribers?.length ? '' : 'No subscribers found.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The audience could not be loaded.')
    } finally {
      setLoading(false)
    }
  }
  async function unsubscribe(id: string) {
    if (!confirm('Unsubscribe this address from studio emails?')) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data: { error?: string } = await response.json()
      if (!response.ok) throw new Error(data.error || 'The subscription could not be updated.')
      setSubscribers((items) =>
        items.map((item) => (item.id === id ? { ...item, status: 'unsubscribed' } : item)),
      )
      setMessage('Address unsubscribed.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The subscription could not be updated.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className="audience-panel">
      <h3>Audience</h3>
      <p>
        Manage newsletter subscribers without leaving the studio. Delivery and confirmation are
        handled by the configured email provider.
      </p>
      <button disabled={loading} onClick={() => load()}>
        Refresh audience
      </button>
      {nextCursor && (
        <button disabled={loading} onClick={() => load(nextCursor)}>
          Next page
        </button>
      )}
      <p role="status" aria-live="polite">
        {loading ? 'Loading…' : message}
      </p>
      {subscribers.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((person) => (
              <tr key={person.id}>
                <td>{person.email}</td>
                <td>{person.status}</td>
                <td>
                  <button
                    disabled={loading || person.status !== 'active'}
                    onClick={() => unsubscribe(person.id)}
                  >
                    Unsubscribe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
