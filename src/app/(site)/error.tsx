'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page rendering failed:', error.digest || error.name)
  }, [error])
  return (
    <section className="section-pad page-section">
      <span className="eyebrow">Studio unavailable</span>
      <h1>
        A signal
        <br />
        <em>interrupted.</em>
      </h1>
      <p>This page could not be loaded. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again ↗
      </button>
    </section>
  )
}
