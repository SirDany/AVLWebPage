import Link from 'next/link'
import type { ExhibitionPost } from '@/lib/exhibition'
import { media } from '@/lib/content'
import { RichContent } from './RichContent'

export function PostContent({ post }: { post: ExhibitionPost }) {
  const image = media(post.cover)
  return (
    <article className="journal-detail section-pad">
      {post.demonstration && <p className="demo-notice">Sample journal / demonstration content.</p>}
      <Link href="/journal" className="back-link">
        ← Journal
      </Link>
      <div className="eyebrow">
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
            day: 'numeric',
          })}
        </time>
      </div>
      <h1>{post.title}</h1>
      <p className="lead">{post.summary}</p>
      {image && (
        <img
          className={`journal-cover ${post.demonstration ? 'study-cover' : ''}`}
          src={image.url!}
          alt={image.alt}
          width={image.width || 1200}
          height={image.height || 800}
        />
      )}
      <RichContent data={post.body} />
      <Link href="/journal" className="button">
        More from the studio ↗
      </Link>
    </article>
  )
}
