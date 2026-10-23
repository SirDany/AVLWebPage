import Link from 'next/link'
import { media } from '@/lib/content'
import type { ExhibitionProject } from '@/lib/exhibition'
import { OrbitalMenu, type OrbitalItem } from './OrbitalMenu'

export function Exhibition({
  projects,
  projectID,
}: {
  projects: ExhibitionProject[]
  projectID?: number | null
}) {
  const projectItems: OrbitalItem[] = projects.map((project) => {
    const image = media(project.cover)
    return {
      id: project.id,
      title: project.title,
      summary: project.summary,
      href: `/work/${project.slug}`,
      sample: project.demonstration,
      image: image ? { url: image.url!, alt: image.alt } : undefined,
      date: project.stage === 'completed' ? project.completedAt : undefined,
      state:
        project.stage !== 'completed'
          ? project.stage === 'upcoming'
            ? 'Upcoming'
            : 'In progress'
          : undefined,
    }
  })
  return (
    <div className="celestial-home">
      <h1 className="sr-only">AVL — Selected projects</h1>
      {projects.length ? (
        <div className="celestial-stage">
          <OrbitalMenu items={projectItems} initialID={projectID} />
        </div>
      ) : (
        <section className="celestial-empty">
          <h2>AVL</h2>
          <Link className="text-link" href="/about">
            About the artist ↗
          </Link>
        </section>
      )}
    </div>
  )
}
