import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Link from 'next/link'
import { Header, Footer } from '../src/components/SiteChrome'
import { Newsletter } from '../src/components/Newsletter'
import { ProjectContent } from '../src/components/ProjectContent'
import { PostContent } from '../src/components/PostContent'
import Home from '../src/app/(site)/page'
import Work from '../src/app/(site)/work/page'
import Journal from '../src/app/(site)/journal/page'
import { InterfaceAudio } from '../src/components/InterfaceAudio'
import NotFound from '../src/app/(site)/not-found'
import About from '../src/app/(site)/about/page'
import sharp from 'sharp'
import path from 'node:path'
import sitemap from '../src/app/sitemap'
import { getHomepageContent, getPosts, getProjects, getSettings } from '../src/lib/content'
import {
  demoMetadata,
  demoPost,
  demoPosts,
  demoProject,
  demoProjects,
  exhibitionContent,
} from '../src/lib/exhibition'
import type { SiteSetting } from '../src/payload-types'
import { orbitIndex, orbitNodes } from '../src/lib/orbit'

const sitemapFind = vi.hoisted(() => vi.fn())
vi.mock('../src/lib/content', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/lib/content')>()
  return {
    ...original,
    getSettings: vi.fn(),
    getProjects: vi.fn(),
    getPosts: vi.fn(),
    getHomepageContent: vi.fn(),
    getCMS: vi.fn(async () => ({ find: sitemapFind })),
  }
})

const settings: SiteSetting = {
  id: 1,
  tagline: 'An old marketing slogan.',
  introduction: 'An old promotional paragraph.',
  commissionsOpen: false,
}
const emptyPage = {
  docs: [],
  totalDocs: 0,
  totalPages: 1,
  limit: 12,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
}

beforeEach(() => {
  vi.stubEnv('AVL_DEMO_CONTENT', 'true')
  vi.mocked(getSettings).mockResolvedValue(settings)
  vi.mocked(getProjects).mockResolvedValue({ ...emptyPage })
  vi.mocked(getPosts).mockResolvedValue({ ...emptyPage })
  vi.mocked(getHomepageContent).mockImplementation(async () => ({
    settings: await getSettings(),
    projects: (await getProjects()).docs,
    projectID: undefined,
  }))
})

describe('Public site presentation', () => {
  it('public pages expose the brand, navigation and actual commission availability', () => {
    const header = renderToStaticMarkup(<Header settings={settings} />)
    expect(header).toContain('alt="AVL"')
    expect(header).toContain('/brand/avl-mark.png')
    for (const href of ['/journal', '/about', '/contact'])
      expect(header).toContain(`href="${href}"`)
    expect(header).not.toContain('href="/work"')
    expect(header).toContain('Commissions closed')
    const enabled = renderToStaticMarkup(
      <Header settings={{ ...settings, commissionsOpen: true }} />,
    )
    expect(enabled).toContain('Commissions open')
    const footer = renderToStaticMarkup(<Footer settings={settings} />)
    expect(footer).not.toContain('Imagined elsewhere')
    expect(footer).toContain('href="/privacy"')
    const missing = renderToStaticMarkup(<NotFound />)
    expect(missing).toContain('Page not found')
    expect(missing).not.toContain('world')
  })

  it('homepage showcases projects without a journal panel or closing block', async () => {
    const html = renderToStaticMarkup(await Home())
    expect(html).toContain('src="/studies/vesper.webp"')
    expect(html).toContain('href="/work/study-vesper"')
    expect(html).toContain('aria-label="Project constellation"')
    expect(html).not.toContain('Journal constellation')
    for (const project of demoProjects.slice(0, 3))
      expect(html).toContain(`aria-label="Select ${project.title}"`)
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html.match(/<h2>/g)).toHaveLength(1)
    expect(html).not.toContain('Sample journal')
    for (const absent of [
      settings.tagline,
      settings.introduction,
      'Artifacts from elsewhere',
      'Imagined elsewhere',
      '/brand/avl-seal.jpeg',
      'The collection is taking shape',
      'Pause motion',
      'All work',
      'href="/contact"',
    ])
      expect(html).not.toContain(absent)
    vi.mocked(getHomepageContent).mockResolvedValueOnce({
      settings,
      projects: demoProjects,
      projectID: demoProjects[3].id,
    })
    const configured = renderToStaticMarkup(await Home())
    expect(configured).toContain(`href="/work/${demoProjects[3].slug}"`)
    expect(configured).not.toContain('href="/journal/')
    expect(configured).not.toContain('href="/work/study-vesper"')
  })

  it('demo content is identified, gated and cannot replace real published content', async () => {
    const demo = demoProject('study-vesper', true)!
    expect(renderToStaticMarkup(<ProjectContent project={demo} />)).toContain(
      'demonstration content',
    )
    expect(
      renderToStaticMarkup(<PostContent post={demoPost(demoPosts[0].slug, true)!} />),
    ).toContain('Sample journal')
    expect(demoProject(demo.slug, false)).toBeNull()
    expect(demoPost(demoPosts[0].slug, false)).toBeNull()
    expect(exhibitionContent([], demoProjects, false)).toEqual([])
    const real = {
      ...demo,
      id: 12,
      title: 'A real published costume',
      demonstration: undefined,
    }
    const published = [real]
    expect(exhibitionContent(published, demoProjects, true)).toEqual(published)
    vi.mocked(getProjects).mockResolvedValue({ ...emptyPage, docs: published, totalDocs: 1 })
    const home = renderToStaticMarkup(await Home())
    expect(home).toContain(real.title)
    expect(home).not.toContain('href="/work/study-orrery"')
  })

  it('the public footer has no branding link or studio login', () => {
    const html = renderToStaticMarkup(
      <Footer
        settings={{
          ...settings,
          socials: [{ label: 'Portfolio channel', url: 'https://example.com/avl' }],
        }}
      />,
    )
    for (const absent of ['href="/admin"', 'Studio login', 'href="/"', '<img'])
      expect(html).not.toContain(absent)
    for (const href of ['/privacy', '/legal', 'https://example.com/avl'])
      expect(html).toContain(`href="${href}"`)
    expect(html).toContain(`© ${new Date().getFullYear()} AVL`)
    expect(renderToStaticMarkup(<Footer settings={settings} />)).not.toContain('<nav')
  })

  it('retired archive redirects home while project navigation returns to the showcase', () => {
    try {
      Work()
      expect.fail('Expected an archive redirect')
    } catch (error) {
      expect(error).toHaveProperty('digest', 'NEXT_REDIRECT;replace;/;308;')
    }
    const detail = renderToStaticMarkup(<ProjectContent project={demoProjects[0]} />)
    expect(detail).toContain('href="/"')
    expect(detail).not.toContain('href="/work"')
    expect(detail).toContain('Project showcase')
  })

  it.each([0, 1, 2, 3, 5, 12])(
    'project rotation wraps in both directions without duplicate nodes for %i projects',
    (count) => {
      for (let position = -30; position <= 30; position++) {
        const index = orbitIndex(position, count)
        expect(index).toBeGreaterThanOrEqual(0)
        expect(index).toBeLessThan(Math.max(1, count))
        const nodes = orbitNodes(position, count)
        expect(new Set(nodes.map((node) => node.index)).size).toBe(nodes.length)
        if (count) {
          expect(nodes.find((node) => node.distance === 0)?.index).toBe(index)
          expect(orbitIndex(position + count, count)).toBe(index)
          expect(orbitIndex(position - count, count)).toBe(index)
          const next = orbitNodes(position + 1, count)
          for (const node of nodes) {
            const retained = next.find((candidate) => candidate.position === node.position)
            if (retained) expect(retained.distance).toBe(node.distance - 1)
          }
        } else expect(nodes).toEqual([])
      }
    },
  )

  it('journal presents chronological dated entries', async () => {
    const html = renderToStaticMarkup(await Journal({ searchParams: Promise.resolve({}) }))
    expect(html).toContain('<ol')
    expect(html).toContain('aria-label="Journal timeline"')
    const chronological = [...demoPosts].sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    )
    for (let i = 1; i < chronological.length; i++) {
      expect(html.indexOf(`href="/journal/${chronological[i - 1].slug}"`)).toBeLessThan(
        html.indexOf(`href="/journal/${chronological[i].slug}"`),
      )
    }
    expect(html.match(/<time/g)).toHaveLength(demoPosts.length)
  })

  it('demonstration project exposes its gallery, process and usable resources without tags', () => {
    const html = renderToStaticMarkup(<ProjectContent project={demoProjects[0]} />)
    for (const href of [
      '/studies/vesper-profile.webp',
      '/studies/vesper-detail.webp',
      '/studies/vesper-process.webp',
      '/studies/vesper-notes.pdf',
      '/studies/vesper-token.stl',
      '/studies/vesper-film.webm',
      '/studies/vesper-film.mp4',
      'https://www.blender.org/',
    ])
      expect(html).toContain(href)
    for (const title of ['Process', 'Finding the proportion', 'Tools, materials &amp; files'])
      expect(html).toContain(title)
    expect(html).not.toContain('Costume &amp; character')
    expect(html).not.toContain('>Completed<')
    expect(html).toContain('download=""')
    const affiliate = renderToStaticMarkup(
      <ProjectContent
        project={{
          ...demoProjects[0],
          resources: [
            {
              label: 'Actual configured affiliate resource',
              kind: 'link',
              url: 'https://example.com/tool',
              affiliate: true,
            },
          ],
        }}
      />,
    )
    expect(affiliate).toContain('Some links below are affiliate links.')
    expect(affiliate).toContain('rel="sponsored noopener noreferrer"')
  })

  it('interaction sound is available by default with an explicit mute control', () => {
    const html = renderToStaticMarkup(
      <InterfaceAudio>
        <Link href="/work">Work</Link>
      </InterfaceAudio>,
    )
    expect(html).toContain('aria-label="Mute interaction sounds"')
    expect(html).toContain('aria-pressed="false"')
    expect(html).not.toContain('Enable sound')
  })

  it('public branding retains the original logo colours', async () => {
    const header = renderToStaticMarkup(<Header settings={settings} />)
    const about = renderToStaticMarkup(await About())
    expect(header).toContain('/brand/avl-mark.png')
    expect(about).toContain('/brand/avl-seal.png')
    for (const name of ['mark', 'seal']) {
      const source = await sharp(path.resolve(`public/brand/avl-${name}.jpeg`))
        .ensureAlpha()
        .raw()
        .toBuffer()
      const derivative = await sharp(path.resolve(`public/brand/avl-${name}.png`))
        .ensureAlpha()
        .raw()
        .toBuffer()
      expect(derivative.length).toBe(source.length)
      let visible = 0
      let transparent = 0
      let violet = 0
      let teal = 0
      let gold = 0
      let changed = 0
      for (let i = 0; i < derivative.length; i += 4) {
        if (derivative[i + 3] === 0) transparent++
        if (derivative[i + 3] !== 255) continue
        visible++
        for (let c = 0; c < 3; c++) if (derivative[i + c] !== source[i + c]) changed++
        const [r, g, b] = [derivative[i], derivative[i + 1], derivative[i + 2]]
        if (r < 60 && g < 35 && b > g + 10) violet++
        if (g > r + 30 && b > r + 30) teal++
        if (r > 90 && r > g && g > b + 20) gold++
      }
      expect(visible).toBeGreaterThan(5000)
      expect(changed).toBe(0)
      expect(transparent).toBeGreaterThan(5000)
      expect(violet).toBeGreaterThan(500)
      expect(teal).toBeGreaterThan(100)
      if (name === 'seal') expect(gold).toBeGreaterThan(500)
    }
  })

  it('demo pages are excluded from search indexing and sitemap output', async () => {
    expect(demoMetadata(demoProjects[0])).toEqual({
      robots: { index: false, follow: false },
      alternates: { canonical: null },
    })
    sitemapFind.mockResolvedValue({ docs: [{ slug: 'published-work', updatedAt: '2026-10-23' }] })
    const entries = await sitemap()
    expect(entries.some((entry) => entry.url.endsWith('/work/published-work'))).toBe(true)
    expect(entries.some((entry) => entry.url.includes('study-'))).toBe(false)
    expect(entries.some((entry) => entry.url === 'http://localhost:3000/work')).toBe(false)
  })

  it('disabled demo mode keeps useful navigation without fabricated work or empty promotional sections', async () => {
    vi.stubEnv('AVL_DEMO_CONTENT', 'false')
    const html = renderToStaticMarkup(await Home())
    expect(html).toContain('<h2>AVL</h2>')
    expect(html).toContain('href="/about"')
    expect(html).not.toContain('href="/contact"')
    for (const absent of [
      'study-vesper',
      'Sample journal',
      'taking shape',
      'coming soon',
      'newsletter-email',
    ])
      expect(html).not.toContain(absent)
  })

  it('unconfigured newsletter controls are omitted from the public presentation', () => {
    expect(renderToStaticMarkup(<Newsletter enabled={false} />)).toBe('')
    const enabled = renderToStaticMarkup(<Newsletter enabled />)
    expect(enabled).toContain('type="email"')
    expect(enabled).toContain('Studio updates')
    expect(enabled).toContain('href="/privacy"')
  })
})
