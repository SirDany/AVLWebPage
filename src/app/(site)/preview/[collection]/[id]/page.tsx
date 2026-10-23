import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getCMS } from '@/lib/content'
import { ProjectContent } from '@/components/ProjectContent'
import { PostContent } from '@/components/PostContent'

export const metadata: Metadata = {
  title: 'Private preview',
  robots: { index: false, follow: false },
}
export default async function Preview({
  params,
}: {
  params: Promise<{ collection: string; id: string }>
}) {
  const payload = await getCMS()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')
  const { collection, id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const options = {
    overrideAccess: false as const,
    user,
    draft: true,
    where: { id: { equals: Number(id) } },
    limit: 1,
    depth: 2,
  }
  let content: React.ReactNode
  if (collection === 'projects') {
    const result = await payload.find({ collection: 'projects', ...options })
    if (!result.docs[0]) notFound()
    content = <ProjectContent project={result.docs[0]} />
  } else if (collection === 'posts') {
    const result = await payload.find({ collection: 'posts', ...options })
    if (!result.docs[0]) notFound()
    content = <PostContent post={result.docs[0]} />
  } else notFound()
  return (
    <>
      <div className="preview-notice" role="status">
        Private preview / Saved changes only / Not visible to visitors
      </div>
      {content}
    </>
  )
}
