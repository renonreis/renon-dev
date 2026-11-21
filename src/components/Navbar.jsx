import { LINKS, NAVBAR } from '../content.js'

export default function Navbar() {
  return (
    <>
      <a href="#main" className="pill skip-link">
        {NAVBAR.skipLink}
      </a>
      <nav className="nav">
        <a href={LINKS.top} className="nav-icon nav-logo" aria-label={NAVBAR.monogramLabel}>
          <svg viewBox="0 0 46 35" aria-hidden="true" focusable="false">
            <text
              x="0"
              y="34"
              textLength="46"
              lengthAdjust="spacingAndGlyphs"
              fill="currentColor"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="900"
              fontSize="48"
            >
              GTD
            </text>
          </svg>
        </a>
        <div className="nav-right">
          <a href={LINKS.hireMe} className="pill pill-sm nav-pill">
            {NAVBAR.hireMe}
          </a>
          <button type="button" className="nav-icon nav-menu" aria-label={NAVBAR.menuLabel} aria-expanded="false">
            <span />
            <span />
          </button>
        </div>
      </nav>
    </>
  )
}
