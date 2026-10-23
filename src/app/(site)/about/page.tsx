import type { Metadata } from 'next'
import Link from 'next/link'
import { getSettings } from '@/lib/content'
import { RichContent } from '@/components/RichContent'

export const metadata: Metadata = { title: 'About', alternates: { canonical: '/about' } }
export default async function About() {
  const settings = await getSettings()
  return (
    <section className="section-pad page-section">
      <div className="about-layout">
        <div>
          <h1>AVL</h1>
          {settings.about ? (
            <RichContent data={settings.about} />
          ) : (
            <div className="prose">
              <p>Costume, prop making and art. Finished projects and selected process notes.</p>
            </div>
          )}
          <Link className="button" href="/">
            Project showcase ↗
          </Link>
        </div>
        <figure className="about-seal">
          <img
            src="/brand/avl-seal.png"
            alt="The complete AVL seal, combining a winged animal, sacred geometry, and mathematical notation"
            width="768"
            height="768"
          />
        </figure>
      </div>
    </section>
  )
}
