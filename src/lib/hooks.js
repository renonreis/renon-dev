import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from './scroll.js'

export function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const change = () => setMatches(mq.matches)
    mq.addEventListener('change', change)
    return () => mq.removeEventListener('change', change)
  }, [query])
  return matches
}

// Scroll-scrubbed clip. The clip is fetched whole into memory after page load (as live's html5
// path does) so every seek is instant. Set `frame.current.progress` from a ScrollTrigger and call
// `seek()`; the clip plays between `from` and `to` (fractions of that progress, set here or later
// from a ScrollTrigger callback), holding its first and last frames either side.
export function useScrubClip(src, frames, fps, { from = 0, to = 1 } = {}) {
  const video = useRef(null)
  const frame = useRef({ progress: 0, from, to, shown: -1 })

  const seek = useCallback(() => {
    const v = video.current
    const f = frame.current
    const t = gsap.utils.clamp(0, 1, (f.progress - f.from) / (f.to - f.from || 1))
    const n = Math.round(t * (frames - 1))
    if (!v || v.readyState < 1 || n === f.shown) return
    f.shown = n
    v.currentTime = (n + 0.5) / fps
  }, [frames, fps])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const v = video.current
    const abort = new AbortController()
    let url
    const load = () =>
      fetch(src, { signal: abort.signal })
        .then((r) => r.blob())
        .then((blob) => {
          url = URL.createObjectURL(blob)
          frame.current.shown = -1
          v.src = url
        })
        .catch(() => {})
    const start = () => (window.requestIdleCallback ? window.requestIdleCallback(load) : setTimeout(load, 200))
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      abort.abort()
      window.removeEventListener('load', start)
      v.removeAttribute('src')
      v.load()
      if (url) URL.revokeObjectURL(url)
    }
  }, [src])

  return { video, frame, seek }
}

// Native scroll-snap carousel standing in for live's Embla. `perPage()` says how many slides show
// at once; the pagination shows one dot per page.
export function useCarousel(ref, count, perPage) {
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const total = Math.ceil(count / perPage())
      const max = el.scrollWidth - el.clientWidth
      setPages(total)
      setPage(max > 0 ? Math.round((el.scrollLeft / max) * (total - 1)) : 0)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref, count, perPage])
  return { pages, page }
}
