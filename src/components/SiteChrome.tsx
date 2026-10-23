import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import { isHTTPS } from '@/lib/validation'

export function Header({ settings }: { settings: SiteSetting }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="AVL home">
        <img src="/brand/avl-mark.png" alt="AVL" width="160" height="70" />
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/journal">Journal</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <Link href="/contact" className={`availability ${settings.commissionsOpen ? 'open' : ''}`}>
        <span />
        Commissions {settings.commissionsOpen ? 'open' : 'closed'}
      </Link>
    </header>
  )
}

export function Footer({ settings }: { settings: SiteSetting }) {
  const socials = settings.socials?.filter((item) => isHTTPS(item.url)) || []
  return (
    <footer className="site-footer">
      {socials.length > 0 && (
        <div className="footer-top">
          <nav aria-label="Social channels">
            {socials.map((item) => (
              <a
                key={item.id || item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label} ↗
              </a>
            ))}
          </nav>
        </div>
      )}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AVL</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/legal">Legal</Link>
        </div>
      </div>
    </footer>
  )
}
