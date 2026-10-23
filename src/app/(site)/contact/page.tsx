import type { Metadata } from 'next'
import { getSettings } from '@/lib/content'
import { isHTTPS } from '@/lib/validation'

export const metadata: Metadata = {
  title: 'Contact & commissions',
  alternates: { canonical: '/contact' },
}
export default async function Contact() {
  const settings = await getSettings()
  const socials = settings.socials?.filter((item) => isHTTPS(item.url)) || []
  return (
    <section className="section-pad page-section contact-page">
      <h1>Contact</h1>
      <div className="contact-grid">
        <div className="contact-box">
          <span className={`availability ${settings.commissionsOpen ? 'open' : ''}`}>
            <span />
            Commissions {settings.commissionsOpen ? 'open' : 'closed'}
          </span>
          <h2>Commissions</h2>
          <p>{settings.commissionNote}</p>
          {settings.contactEmail ? (
            <>
              <a
                className="button"
                href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent('AVL / Studio inquiry')}`}
              >
                Contact the studio ↗
              </a>
              <p className="contact-email">{settings.contactEmail}</p>
              <p className="fine-print">
                For commission inquiries, include the idea, intended timeline, and approximate
                budget. An inquiry is not a booking.
              </p>
            </>
          ) : (
            <p>Contact details have not been published.</p>
          )}
        </div>
        {socials.length > 0 && (
          <div className="contact-channels">
            <h2>Social</h2>
            {socials.map((item) => (
              <a
                key={item.id || item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
                <span>↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
