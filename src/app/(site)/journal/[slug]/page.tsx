import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPresentedPost } from '@/lib/content'
import { demoMetadata } from '@/lib/exhibition'
import { PostContent } from '@/components/PostContent'

type Args = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const post = await getPresentedPost((await params).slug)
  return post
    ? {
        title: post.title,
        description: post.summary,
        alternates: { canonical: `/journal/${post.slug}` },
        ...demoMetadata(post),
      }
    : { title: 'Entry not found' }
}
export default async function PostPage({ params }: Args) {
  const post = await getPresentedPost((await params).slug)
  if (!post) notFound()
  return <PostContent post={post} />
}
