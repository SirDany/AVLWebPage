import Link from 'next/link'
import type { ExhibitionProject } from '@/lib/exhibition'
import { categoryLabels, media, stageLabels } from '@/lib/content'

export function ProjectCard({
  project,
  index = 0,
}: {
  project: ExhibitionProject
  index?: number
}) {
  const image = media(project.cover)
  return (
    <article className={`project-card ${project.demonstration ? 'is-study' : ''}`}>
      <Link
        href={`/work/${project.slug}`}
        className="project-art"
        aria-label={`Explore ${project.title}`}
      >
        {image ? (
          <img
            src={image.sizes?.card?.url || image.url!}
            alt={image.alt}
            width="900"
            height="700"
            loading="lazy"
          />
        ) : (
          <div className="art-placeholder" aria-hidden="true">
            <div className="orbit" />
            <span>AVL</span>
          </div>
        )}
        <span className="project-stage">
          {project.demonstration ? 'Digital study / demo' : stageLabels[project.stage]}
        </span>
        <span className="project-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <div className="project-caption">
        <div>
          <span className="eyebrow">{categoryLabels[project.category]}</span>
          <h3>
            <Link href={`/work/${project.slug}`}>{project.title}</Link>
          </h3>
        </div>
        <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p className="project-summary">{project.summary}</p>
    </article>
  )
}
