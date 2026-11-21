import { useCallback, useLayoutEffect, useRef } from 'react'
import clientsArt from '../assets/site/clients/clients.avif'
import testimonialArt from '../assets/site/clients/testimonial.avif'
import { CLIENTS, LINKS } from '../content.js'
import { cardMotion } from '../lib/cards.js'
import { useCarousel } from '../lib/hooks.js'
import { gsap, prefersReducedMotion } from '../lib/scroll.js'
import { THEME, themeStep } from '../lib/theme.js'
import Card from './Card.jsx'
import Pager from './Pager.jsx'
import SectionHeader from './SectionHeader.jsx'

const PHONE_PORTRAIT = '(max-width: 767.98px) and (orientation: portrait)'

// Live Shop cards' computed theme variables. The first card has the shop theme on the card colour
// #20234c; the second the base theme. Both art pictures fade out under the text (live fades only the
// first): our postcard art is busy where the title sits.
const CARDS = [
  {
    href: LINKS.clients,
    img: clientsArt,
    vars: { '--card-bg': '#20234c', '--card-glow': '#3f284b', '--card-eyebrow': '#fee8ea', '--card-outline': '#ffd4a8', '--pill': '#ffd4a8', '--pill-text': '#0f0c1a', '--pill-hover': '#ffc080', '--pill-active': '#ffa74d' },
  },
  {
    href: LINKS.review,
    img: testimonialArt,
    vars: { '--card-bg': '#252644', '--card-glow': '#2f2e52', '--card-eyebrow': '#f1eaff', '--card-outline': '#ffb2c6', '--pill': '#ffb2c6', '--pill-text': '#0f0c1a', '--pill-hover': '#fc97b1', '--pill-active': '#f77e9c' },
  },
]

export default function Clients() {
  const root = useRef(null)
  const carousel = useRef(null)
  const perPage = useCallback(() => (window.matchMedia(PHONE_PORTRAIT).matches ? 1 : 2), [])
  const { pages, page } = useCarousel(carousel, CLIENTS.cards.length, perPage)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    let cleanCards
    const ctx = gsap.context(() => {
      themeStep(root.current, THEME.offTheClock, THEME.clients)
      cleanCards = cardMotion(root.current)
    }, root)
    return () => {
      cleanCards?.()
      ctx.revert()
    }
  }, [])

  return (
    <section className="clients grid-section row-section" ref={root} id="clients" aria-labelledby="clients-title">
      <SectionHeader id="clients-title" title={CLIENTS.header} link={CLIENTS.link} href={LINKS.clients} />
      <div className="carousel clients-carousel" ref={carousel}>
        <div className="carousel-track">
          {CLIENTS.cards.map((c, i) => (
            <div className="carousel-slide clients-slide" key={c.title}>
              <Card
                href={CARDS[i].href}
                variant="short"
                className="card-stack card-fade"
                theme={CARDS[i].vars}
                img={CARDS[i].img}
                eyebrow={c.eyebrow}
                title={c.title}
                cta={c.button}
              />
            </div>
          ))}
        </div>
      </div>
      <Pager pages={pages} page={page} />
    </section>
  )
}
