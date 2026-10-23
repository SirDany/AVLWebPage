import type { Metadata } from 'next'
import { Header, Footer } from '@/components/SiteChrome'
import { getSettings } from '@/lib/content'
import { InterfaceAudio } from '@/components/InterfaceAudio'
import './site.css'
import './exhibition.css'
import './light-and-space.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: { default: 'AVL — Selected work', template: '%s | AVL' },
  description: 'Costume, props and art by AVL. Selected projects, process notes and commissions.',
  openGraph: {
    type: 'website',
    siteName: 'AVL',
    images: [{ url: '/brand/avl-seal.jpeg', width: 768, height: 768 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <InterfaceAudio>
          <Header settings={settings} />
          <main id="main">{children}</main>
          <Footer settings={settings} />
        </InterfaceAudio>
      </body>
    </html>
  )
}
