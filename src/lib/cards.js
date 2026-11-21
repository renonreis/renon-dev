import { gsap } from './scroll.js'

// Live [data-speed=0.97] picture parallax. Fitted to the measured values at 375 and 1440 (scale and
// ±y match to 0.1px): the picture travels (vh + h)·(1 − s)/s² over a scroll range of (vh + h)/s²
// centred on the card, i.e. 0.03px per px of scroll, and is scaled up so its edges never show.
const SPEED = 0.97
const travel = (card) => ((window.innerHeight + card.offsetHeight) * (1 - SPEED)) / SPEED ** 2

// Pointer-follow mask on the wide cards (live quickTo .3s on the mask centre, clamped).
function followMask(card) {
  const pos = { x: -5, y: 140 }
  const apply = () => {
    card.style.setProperty('--mx', `${pos.x}%`)
    card.style.setProperty('--my', `${pos.y}%`)
  }
  const toX = gsap.quickTo(pos, 'x', { duration: 0.3, ease: 'none', onUpdate: apply })
  const toY = gsap.quickTo(pos, 'y', { duration: 0.3, ease: 'none', onUpdate: apply })
  const move = (e) => {
    const r = card.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    toX(gsap.utils.clamp(-15, 5, -5 - 10 * (2 * nx - 1)))
    toY(gsap.utils.clamp(133, 147, 140 - 7 * (2 * ny - 1)))
  }
  const leave = () => {
    toX(-5)
    toY(140)
  }
  card.addEventListener('pointermove', move)
  card.addEventListener('pointerleave', leave)
  return () => {
    card.removeEventListener('pointermove', move)
    card.removeEventListener('pointerleave', leave)
  }
}

// Scroll motion shared by every card (live card code): scale .985 → 1 over the first half of the
// card's pass through the viewport, then hold; picture parallax. Call inside a gsap.context.
export function cardMotion(scope) {
  const cleanups = []
  gsap.utils.toArray('.card', scope).forEach((card) => {
    gsap
      .timeline({ scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })
      .fromTo(card, { scale: 0.985 }, { scale: 1, duration: 50, ease: 'none' })
      .to({}, { duration: 50 })

    const pic = card.querySelector('.card-picture')
    if (pic) {
      const scale = () => (pic.offsetHeight + travel(card)) / pic.offsetHeight
      gsap.fromTo(
        pic,
        { y: () => -travel(card) / 2, scale },
        {
          y: () => travel(card) / 2,
          scale,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: () => `center center+=${travel(card) / (1 - SPEED) / 2}`,
            end: () => `center center-=${travel(card) / (1 - SPEED) / 2}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )
    }

    if (card.hasAttribute('data-follow')) cleanups.push(followMask(card))
  })
  return () => cleanups.forEach((fn) => fn())
}
