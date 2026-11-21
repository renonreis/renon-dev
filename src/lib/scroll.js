import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

// Measuring scripts in .measure/ read trigger positions from here.
if (import.meta.env.DEV) window.__ST = ScrollTrigger

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Live: Lenis only off touch devices, lerp .07, wheelMultiplier 1.2, driven by the GSAP ticker
// with lag smoothing off, every scroll forwarded to ScrollTrigger.
export function createSmoothScroll() {
  if (ScrollTrigger.isTouch === 1 || prefersReducedMotion()) return null
  const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 1.2 })
  const tick = (time) => lenis.raf(time * 1000)
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return {
    lenis,
    destroy() {
      gsap.ticker.remove(tick)
      lenis.destroy()
    },
  }
}
