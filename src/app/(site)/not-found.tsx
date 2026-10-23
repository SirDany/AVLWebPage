import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="section-pad page-section">
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>This page is unavailable or has not been published.</p>
      <Link href="/" className="button">
        Project showcase ↗
      </Link>
    </section>
  )
}
