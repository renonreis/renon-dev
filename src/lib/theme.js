import { gsap } from './scroll.js'

// Live theme system: as a themed block scrolls in (its top from the viewport bottom until its
// bottom reaches the viewport bottom) the page colour and the cursor glow's colour move linearly
// from the previous block's theme to its own. Targets were fitted to the live samples
// (AGENTS.md › Findings). Call inside a gsap.context.
export const THEME = {
  base: { bg: 'rgb(12, 13, 27)', spot: 'rgb(31, 31, 56)' },
  openToWork: { bg: '#0f0c1a', spot: '#2d1f36' },
  afterHours: { bg: '#0d0c1a', spot: '#132242' },
  caseStudy: { bg: '#071012', spot: '#142e25' },
  offTheClock: { bg: '#0d0c1a', spot: '#16203f' },
  clients: { bg: '#1d1627', spot: '#31223e' },
}

export function themeStep(trigger, from, to) {
  return gsap.fromTo(
    document.documentElement,
    { '--page-bg': from.bg, '--spot': from.spot },
    {
      '--page-bg': to.bg,
      '--spot': to.spot,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom bottom', scrub: true },
    },
  )
}
