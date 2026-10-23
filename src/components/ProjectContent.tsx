import Link from 'next/link'
import type { ExhibitionProject } from '@/lib/exhibition'
import { media } from '@/lib/content'
import { RichContent } from './RichContent'
import { Video } from './Video'
import { isHTTPS } from '@/lib/validation'

export function ProjectContent({ project }: { project: ExhibitionProject }) {
  const cover = media(project.cover)
  return (
    <article
      className={`project-detail layout-${project.layout} ${project.demonstration ? 'is-study' : ''}`}
    >
      {project.demonstration && (
        <p className="demo-notice">
          Digital study / demonstration content. Not a completed physical project.
        </p>
      )}
      <header className="project-title section-pad">
        <Link href="/" className="back-link">
          ← Project showcase
        </Link>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
      </header>
      {cover && (
        <figure className="project-cover">
          <img
            src={cover.url!}
            alt={cover.alt}
            width={cover.width || 1600}
            height={cover.height || 1000}
            fetchPriority="high"
          />
          {cover.credit && <figcaption>{cover.credit}</figcaption>}
        </figure>
      )}
      {Boolean(project.gallery?.length) && (
        <section className="project-gallery section-pad" aria-label="Project gallery">
          {project.gallery?.map((item, index) => {
            const image = media(item.image)
            return image ? (
              <figure key={item.id || index}>
                <a href={image.url!} target="_blank" rel="noopener noreferrer">
                  <img
                    src={image.url!}
                    alt={image.alt}
                    width={image.width || 1000}
                    height={image.height || 1000}
                    loading="lazy"
                  />
                </a>
                {(item.caption || image.credit) && (
                  <figcaption>
                    {[item.caption, image.credit].filter(Boolean).join(' / ')}
                  </figcaption>
                )}
              </figure>
            ) : null
          })}
        </section>
      )}
      {project.youtubeID && (
        <section className="section-pad">
          <Video id={project.youtubeID} title={`${project.title} / Film`} />
        </section>
      )}
      {project.demonstration && project.demoFilm && (
        <section className="section-pad sample-film">
          <h2>Surface &amp; light</h2>
          <p>Original digital preview film. An illustration, not footage of a physical build.</p>
          <video
            controls
            preload="none"
            poster={cover?.url || undefined}
            aria-label={`${project.title} digital surface study`}
          >
            <source src={project.demoFilm.mp4} type="video/mp4" />
            <source src={project.demoFilm.webm} type="video/webm" />
            <a href={project.demoFilm.mp4}>Download the digital preview film</a>
          </video>
          <p>
            <a className="text-link" href={project.demoFilm.mp4} download>
              Download the digital preview film ↗
            </a>
          </p>
        </section>
      )}
      {project.story && (
        <section className="story-section section-pad">
          <h2>Process</h2>
          <RichContent data={project.story} />
        </section>
      )}
      {Boolean(project.resources?.length) && (
        <section className="resources section-pad">
          <div className="section-heading">
            <div>
              <h2>Tools, materials &amp; files</h2>
            </div>
          </div>
          {project.resources?.some((item) => item.affiliate) && (
            <p className="affiliate-disclosure">
              Some links below are affiliate links. Purchases through these links may support AVL
              through a commission, at no additional cost.
            </p>
          )}
          <div className="resource-list">
            {project.resources?.map((resource, index) => {
              const file = media(resource.file)
              const href =
                resource.kind === 'download'
                  ? file?.url
                  : isHTTPS(resource.url)
                    ? resource.url
                    : null
              return (
                <div className="resource-item" key={resource.id || index}>
                  <div>
                    <h3>{resource.label}</h3>
                    {resource.description && <p>{resource.description}</p>}
                    <span className="eyebrow">
                      {resource.kind === 'download'
                        ? 'Public download'
                        : resource.affiliate
                          ? 'Affiliate link'
                          : 'External resource'}
                    </span>
                  </div>
                  {href ? (
                    <a
                      className="text-link"
                      href={href}
                      download={resource.kind === 'download' ? true : undefined}
                      target="_blank"
                      rel={
                        resource.affiliate ? 'sponsored noopener noreferrer' : 'noopener noreferrer'
                      }
                    >
                      {resource.kind === 'download' ? 'Download' : 'Visit'} ↗
                    </a>
                  ) : (
                    <span>Resource unavailable</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
      <section className="project-end section-pad">
        <Link className="button" href="/">
          Project showcase ↗
        </Link>
        <Link className="text-link" href="/contact">
          Commission inquiries ↗
        </Link>
      </section>
    </article>
  )
}
