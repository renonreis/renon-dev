import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Page backdrop, as on live: base colour (z -4), cursor glow (z -3) and the intro overlay (z -2)
// that starts as the page colour and clears during the intro.
export default function Backdrop() {
  const glow = useRef(null)

  useEffect(() => {
    const el = glow.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    gsap.set(el, { xPercent: -50, yPercent: -50 })
    const toX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'none' })
    const toY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'none' })
    const rest = getComputedStyle(el).getPropertyValue('--glow-rest').trim() || 0.5
    let hovered = null
    const move = (e) => {
      toX(e.clientX)
      toY(e.clientY)
    }
    // Brighter over anything clickable (live listens on every button and link).
    const over = (e) => {
      const target = e.target instanceof Element ? e.target.closest('a, button') : null
      if (target === hovered) return
      hovered = target
      gsap.to(el, { opacity: target ? 1 : rest, duration: 0.5, ease: 'sine.inOut', overwrite: 'auto' })
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
    }
  }, [])

  return (
    <>
      <div className="bg-base" aria-hidden="true" />
      {/* The wrapper takes scroll fades so they don't fight the glow's own hover opacity. */}
      <div className="cursor-glow-fade" aria-hidden="true">
        <div className="cursor-glow" ref={glow} />
      </div>
      <div className="bg-overlay" aria-hidden="true" />
    </>
  )
}
