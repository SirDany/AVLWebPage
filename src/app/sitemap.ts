import type { MetadataRoute } from 'next'
import { getCMS } from '@/lib/content'

export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = new URL(process.env.SITE_URL || 'http://localhost:3000').origin
  const payload = await getCMS()
  const options = {
    overrideAccess: false,
    draft: false,
    where: { _status: { equals: 'published' } },
    pagination: false,
    limit: 0,
    depth: 0,
    select: { slug: true as const, updatedAt: true as const },
  }
  const [projects, posts] = await Promise.all([
    payload.find({ collection: 'projects', ...options }),
    payload.find({ collection: 'posts', ...options }),
  ])
  return [
    ...['', '/journal', '/about', '/contact'].map((path) => ({ url: `${base}${path}` })),
    ...projects.docs.map((item) => ({
      url: `${base}/work/${item.slug}`,
      lastModified: new Date(item.updatedAt),
    })),
    ...posts.docs.map((item) => ({
      url: `${base}/journal/${item.slug}`,
      lastModified: new Date(item.updatedAt),
    })),
  ]
}
