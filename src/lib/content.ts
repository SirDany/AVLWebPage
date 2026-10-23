import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'
import { demoPost, demoProject, type ExhibitionPost, type ExhibitionProject } from './exhibition'

export const getCMS = cache(() => getPayload({ config }))
export const getSettings = cache(async () => {
  const payload = await getCMS()
  return payload.findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: false })
})

export const getProjects = cache(async (page = 1, category?: string, stage?: string) => {
  const payload = await getCMS()
  const where: Where = {
    and: [
      { _status: { equals: 'published' } },
      ...(category ? [{ category: { equals: category } }] : []),
      ...(stage ? [{ stage: { equals: stage } }] : []),
    ],
  }
  return payload.find({
    collection: 'projects',
    overrideAccess: false,
    draft: false,
    sort: ['-featured', 'order', '-createdAt'],
    depth: 1,
    limit: 12,
    page,
    where,
  })
})

export const getProject = cache(async (slug: string) => {
  const payload = await getCMS()
  const result = await payload.find({
    collection: 'projects',
    overrideAccess: false,
    draft: false,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: 2,
    limit: 1,
  })
  return result.docs[0] || null
})

export const getPosts = cache(async (page = 1) => {
  const payload = await getCMS()
  return payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    depth: 1,
    limit: 12,
    page,
  })
})

export const getHomepageContent = cache(async () => {
  const [settings, projects, payload] = await Promise.all([getSettings(), getProjects(), getCMS()])
  const projectID =
    typeof settings.initialProject === 'object'
      ? settings.initialProject?.id
      : settings.initialProject
  const projectTarget =
    projectID && !projects.docs.some((item) => item.id === projectID)
      ? payload
          .find({
            collection: 'projects',
            overrideAccess: false,
            draft: false,
            depth: 1,
            limit: 1,
            where: { and: [{ id: { equals: projectID } }, { _status: { equals: 'published' } }] },
          })
          .then((result) => result.docs[0])
      : undefined
  const selectedProject = await projectTarget
  return {
    settings,
    projects: selectedProject ? [...projects.docs.slice(0, 11), selectedProject] : projects.docs,
    projectID,
  }
})

export const getPost = cache(async (slug: string) => {
  const payload = await getCMS()
  const result = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: 1,
    limit: 1,
  })
  return result.docs[0] || null
})

export const getPresentedProject = cache(
  async (slug: string): Promise<ExhibitionProject | null> =>
    (await getProject(slug)) || demoProject(slug),
)
export const getPresentedPost = cache(
  async (slug: string): Promise<ExhibitionPost | null> => (await getPost(slug)) || demoPost(slug),
)

export function media(value: number | Media | null | undefined): Media | null {
  return typeof value === 'object' && value && value.url ? value : null
}

export const stageLabels = {
  completed: 'Completed',
  'in-progress': 'In progress',
  upcoming: 'Upcoming',
}
export const categoryLabels = {
  costume: 'Costume & character',
  props: 'Props & objects',
  art: 'Art',
  software: 'Software',
  other: 'Other explorations',
}
