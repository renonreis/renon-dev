// Carousel pagination pill: one dot per page (display-only, as on live).
export default function Pager({ pages, page }) {
  if (pages < 2) return null
  return (
    <div className="pager-row" aria-hidden="true">
      <div className="pager">
        {Array.from({ length: pages }, (_, i) => (
          <span key={i} className={i === page ? 'is-active' : undefined} />
        ))}
      </div>
    </div>
  )
}
