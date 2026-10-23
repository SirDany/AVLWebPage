import { getHomepageContent } from '@/lib/content'
import { demoProjects, exhibitionContent } from '@/lib/exhibition'
import { Exhibition } from '@/components/Exhibition'
import { Newsletter } from '@/components/Newsletter'
import { newsletterConfigured } from '@/lib/newsletter'
import type { Metadata } from 'next'

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default async function Home() {
  const { settings, projects, projectID } = await getHomepageContent()
  const featured = exhibitionContent(projects, demoProjects)
  return (
    <>
      <Exhibition projects={featured} projectID={projectID} />
      <Newsletter
        enabled={Boolean(
          settings.newsletterEnabled && settings.privacyNotice && newsletterConfigured(),
        )}
      />
    </>
  )
}
