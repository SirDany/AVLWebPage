import type { AdminViewServerProps } from 'payload'
import Link from 'next/link'
import { Audience } from './Audience'

export function StudioOverview({ user }: Partial<AdminViewServerProps>) {
  if (!user) return null
  return (
    <section className="studio-overview">
      <div className="studio-kicker">AVL / Private workspace</div>
      <h2>The studio behind the work.</h2>
      <p>
        Publish projects and journal entries, organize public resources, and control commission
        availability from one workspace.
      </p>
      <nav className="studio-actions" aria-label="Studio shortcuts">
        <Link href="/admin/collections/projects/create">Create project</Link>
        <Link href="/admin/collections/posts/create">Write update</Link>
        <Link href="/admin/globals/site-settings">Site &amp; commission controls</Link>
        <a href="/" target="_blank" rel="noreferrer">
          View website
        </a>
      </nav>
      <Audience />
      <p>
        Sales, social publishing, and cross-channel analytics are planned extensions, not enabled
        services.
      </p>
    </section>
  )
}
