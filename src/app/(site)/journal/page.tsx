import type { Metadata } from 'next'
import Link from 'next/link'
import { getPosts, getSettings } from '@/lib/content'
import { Newsletter } from '@/components/Newsletter'
import { newsletterConfigured } from '@/lib/newsletter'
import { notFound } from 'next/navigation'
import { demoPosts, exhibitionContent, type ExhibitionPost } from '@/lib/exhibition'

export const metadata: Metadata = { title: 'Journal', alternates: { canonical: '/journal' } }
export default async function Journal({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: value } = await searchParams
  const page = value ? Number(value) : 1
  if (!Number.isSafeInteger(page) || page < 1) notFound()
  const [posts, settings] = await Promise.all([getPosts(page), getSettings()])
  if (page > posts.totalPages && page > 1) notFound()
  const displayPosts: ExhibitionPost[] = (
    page === 1 ? exhibitionContent(posts.docs, demoPosts) : posts.docs
  ).toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  return (
    <>
      <section className="section-pad page-section">
        <div className="page-intro">
          <h1>Journal</h1>
        </div>
        {displayPosts.length ? (
          <ol className="journal-list journal-timeline" aria-label="Journal timeline">
            {displayPosts.map((post) => (
              <li key={post.id} className="journal-entry">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </time>
                <div>
                  {post.demonstration && <span className="demo-label">Sample journal</span>}
                  <h2>
                    <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p>{post.summary}</p>
                  <Link className="text-link" href={`/journal/${post.slug}`}>
                    Read entry ↗
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty-collection">
            <div>
              <h2>No entries yet.</h2>
            </div>
          </div>
        )}
        {posts.totalPages > 1 && (
          <nav className="pagination" aria-label="Journal pages">
            {posts.hasPrevPage && <Link href={`/journal?page=${page - 1}`}>← Previous</Link>}
            <span>
              Page {page} of {posts.totalPages}
            </span>
            {posts.hasNextPage && <Link href={`/journal?page=${page + 1}`}>Next →</Link>}
          </nav>
        )}
      </section>
      <Newsletter
        enabled={Boolean(
          settings.newsletterEnabled && settings.privacyNotice && newsletterConfigured(),
        )}
      />
    </>
  )
}
