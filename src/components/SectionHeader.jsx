import { ArrowGlyph } from './Card.jsx'

// Row header for card rows (live Shop / Featured News): the section title and a "View all" link.
// On portrait phones the link shows only its arrow; the label stays for screen readers.
export default function SectionHeader({ id, title, link, href }) {
  return (
    <div className="row-header">
      <h2 className="row-title" id={id}>
        {title}
      </h2>
      <a className="row-link" href={href} aria-label={`${link}: ${title}`}>
        <span className="row-link-label">{link}</span>
        <ArrowGlyph />
      </a>
    </div>
  )
}
