import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSettings } from '@/lib/content'
import { RichContent } from '@/components/RichContent'

type Args = { params: Promise<{ notice: string }> }
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { notice } = await params
  return {
    title: notice === 'privacy' ? 'Privacy' : 'Legal notice',
    robots: { index: false, follow: true },
  }
}
export default async function Notice({ params }: Args) {
  const { notice } = await params
  if (notice !== 'privacy' && notice !== 'legal') notFound()
  const settings = await getSettings()
  const content = notice === 'privacy' ? settings.privacyNotice : settings.legalNotice
  return (
    <section className="section-pad journal-detail">
      <span className="eyebrow">AVL / Information</span>
      <h1>{notice === 'privacy' ? 'Privacy.' : 'Legal notice.'}</h1>
      {content ? (
        <RichContent data={content} />
      ) : (
        <div className="notice-warning">
          <h2>This notice has not been published yet.</h2>
          <p>
            This website is not ready for public launch until the applicable information has been
            reviewed and added. Newsletter signup is disabled by default.
          </p>
        </div>
      )}
    </section>
  )
}
