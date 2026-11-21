// One card, as on live (`s7pzuf*`): a link with a background picture, an optional round play icon,
// and a text block (eyebrow, title, body, pill). Sizes and colours live in styles/cards.css; each
// card's theme comes in as CSS variables.

// Live getHeadlineSize: the title's font step comes from its length.
const headlineSize = (title) => {
  const n = title.length
  return n > 40 ? 5 : n > 30 ? 4 : n > 23 ? 3 : n > 13 ? 2 : 1
}

export function PlayGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M8 5.5v13a.75.75 0 0 0 1.14.64l10.4-6.5a.75.75 0 0 0 0-1.28L9.14 4.86A.75.75 0 0 0 8 5.5Z" />
    </svg>
  )
}

export function ArrowGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Card({
  href,
  variant,
  className = '',
  theme,
  sources = [],
  img,
  eyebrow,
  title,
  text,
  cta,
  ctaIcon = 'arrow',
  play = false,
  follow = false,
}) {
  const Icon = ctaIcon === 'play' ? PlayGlyph : ArrowGlyph
  return (
    <a
      className={`card card-${variant} ${className}`}
      href={href}
      style={theme}
      data-hs={headlineSize(title)}
      data-follow={follow || undefined}
    >
      <picture className="card-picture" aria-hidden="true">
        {sources.map((s) => (
          <source key={s.media} media={s.media} srcSet={s.src} />
        ))}
        <img src={img} alt="" loading="lazy" decoding="async" />
      </picture>
      {play && (
        <span className="card-play" aria-hidden="true">
          <PlayGlyph />
        </span>
      )}
      <span className="card-text">
        {eyebrow && <span className="card-eyebrow">{eyebrow}</span>}
        <span className="card-title" role="heading" aria-level={3}>
          {title}
        </span>
        {text && <span className="card-body">{text}</span>}
        {cta && (
          <span className="card-cta">
            {cta}
            <Icon />
          </span>
        )}
      </span>
    </a>
  )
}
