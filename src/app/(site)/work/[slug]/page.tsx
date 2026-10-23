import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPresentedProject, media } from '@/lib/content'
import { demoMetadata } from '@/lib/exhibition'
import { ProjectContent } from '@/components/ProjectContent'

type Args = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const project = await getPresentedProject((await params).slug)
  if (!project) return { title: 'Project not found' }
  const cover = media(project.cover)
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      ...(cover?.url ? { images: [{ url: cover.url }] } : {}),
    },
    ...demoMetadata(project),
  }
}
export default async function ProjectPage({ params }: Args) {
  const project = await getPresentedProject((await params).slug)
  if (!project) notFound()
  return <ProjectContent project={project} />
}
