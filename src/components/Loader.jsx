import { useEffect, useRef } from 'react'
import loaderLogo from '../assets/brand/loader-logo.svg'
import { LOADER } from '../content.js'
import { whenHeroReady } from '../lib/hero-media.js'

// Shown until fonts and hero images are ready. Then, as on live: finish the current pulse, pause,
// fade the logo out (1000 ms), then start the intro (onFadeout) as the overlay fades (1300 ms).
export default function Loader({ onFadeout, onDone }) {
  const logo = useRef(null)
  const overlay = useRef(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      await whenHeroReady()
      const el = logo.current
      if (!alive || !el) return
      const pulses = el.getAnimations({ subtree: true })
      if (pulses.length) await new Promise((resolve) => el.addEventListener('animationiteration', resolve, { once: true }))
      if (!alive) return
      pulses.forEach((a) => a.pause())
      await el.animate([{ opacity: 0 }], { fill: 'forwards', easing: 'cubic-bezier(0.2, 0, 0.8, 1)', duration: 1000 }).finished
      if (!alive) return
      // Live starts the intro with the logo fade, so the overlay hides most of the fly-in. We start
      // it here instead, so the pieces can be seen coming together (AGENTS.md › Open differences).
      onFadeout()
      await overlay.current.animate([{ opacity: 1 }, { opacity: 0 }], {
        fill: 'forwards',
        easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
        duration: 1300,
      }).finished
      if (alive) onDone()
    })()
    return () => {
      alive = false
    }
  }, [onFadeout, onDone])

  return (
    <div className="loader" ref={overlay} role="status" aria-label={LOADER.label}>
      <div className="loader-logo" ref={logo} style={{ '--loader-logo': `url("${loaderLogo}")` }}>
        <div className="loader-glow" />
        <div className="loader-mask" />
      </div>
    </div>
  )
}
