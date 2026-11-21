import logo from '../assets/site/footer/logo.avif'
import { FOOTER, LINKS } from '../content.js'

// Footer (live outro `jjnta2*`): logo, the "Build Your Own" pill, socials, legal links, and our
// "Rated D for Developer" badge in the live rating slot.
function GitHubGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M0 1.15C0 .51.53 0 1.18 0h13.64C15.47 0 16 .51 16 1.15v13.7c0 .64-.53 1.15-1.18 1.15H1.18C.53 16 0 15.49 0 14.85V1.15Zm4.94 12.25V6.17h-2.4v7.23h2.4ZM3.74 5.18c.84 0 1.36-.55 1.36-1.25-.02-.7-.52-1.25-1.34-1.25-.82 0-1.36.54-1.36 1.25 0 .7.52 1.25 1.33 1.25h.01Zm4.91 8.22V9.36c0-.22.02-.43.08-.59.17-.43.57-.88 1.23-.88.87 0 1.22.66 1.22 1.64v3.87h2.4V9.25c0-2.22-1.19-3.25-2.77-3.25-1.27 0-1.84.7-2.16 1.19v-1.02h-2.4c.03.68 0 7.23 0 7.23h2.4Z" />
    </svg>
  )
}

function CodeGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Our own rating badge (48 × 72, the live slot size): a big D over a "DEVELOPER" band.
function RatingBadge() {
  return (
    <svg className="badge-mark" viewBox="0 0 48 72" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="46" height="70" rx="2" fill="#fff" stroke="#000" strokeWidth="2" />
      <text x="24" y="44" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="900" fontSize="44" fill="#000">
        D
      </text>
      <rect x="1" y="53" width="46" height="18" fill="#000" />
      <text x="24" y="65.5" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="9" fill="#fff" letterSpacing=".3">
        DEVELOPER
      </text>
    </svg>
  )
}

const SOCIAL_GLYPHS = { GitHub: GitHubGlyph, LinkedIn: LinkedInGlyph }

export default function Footer() {
  return (
    <div className="outro" id="footer">
      <div className="outro-logo">
        <img src={logo} alt={FOOTER.logoAlt} width="807" height="540" loading="lazy" decoding="async" />
      </div>
      <footer className="outro-footer">
        <div className="outro-pill-row">
          <a className="outro-pill" href={LINKS.buildYourOwn}>
            <strong className="outro-pill-title">
              <CodeGlyph />
              {FOOTER.pill.title}
            </strong>
            <span className="outro-pill-text">{FOOTER.pill.text}</span>
          </a>
        </div>
        <nav className="outro-nav" aria-label="Footer">
          <ul className="outro-socials" role="list">
            {FOOTER.socials.map(({ label, href }) => {
              const Glyph = SOCIAL_GLYPHS[label]
              return (
                <li key={label}>
                  <a className="outro-social" href={href} target="_blank" rel="noreferrer" aria-label={label}>
                    <Glyph />
                  </a>
                </li>
              )
            })}
          </ul>
          <ul className="outro-legal" role="list">
            {FOOTER.links.map(({ label, href }) => (
              <li key={label}>
                <a className="outro-link" href={href}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="badge">
          <RatingBadge />
          <div className="badge-text">
            <p>
              <strong>{FOOTER.badge.title}:</strong> {FOOTER.badge.text}
            </p>
            <hr />
            <p>{FOOTER.copyright}</p>
          </div>
        </div>
        <p className="outro-note">{FOOTER.disclaimer}</p>
      </footer>
    </div>
  )
}
