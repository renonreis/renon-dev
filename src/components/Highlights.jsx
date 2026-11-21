import { useLayoutEffect, useRef } from 'react'
import afterHours from '../assets/site/highlights/after-hours.avif'
import offTheClock from '../assets/site/highlights/off-the-clock.avif'
import openToWork from '../assets/site/highlights/open-to-work.avif'
import theHeist from '../assets/site/highlights/the-heist.avif'
import { HIGHLIGHTS, LINKS } from '../content.js'
import { cardMotion } from '../lib/cards.js'
import { gsap, prefersReducedMotion } from '../lib/scroll.js'
import { THEME, themeStep } from '../lib/theme.js'
import Card from './Card.jsx'

// Four wide cards (live Feature cards `_15id12y*`), text alternating left / right. Themes are the
// live cards' computed theme variables, in order; `--focal` is where the art's subject sits, used
// for the 3:2 crop on portrait phones.
const CARDS = [
  {
    href: LINKS.hireMe,
    img: openToWork,
    theme: THEME.openToWork,
    vars: { '--card-bg': '#4b2f54', '--card-glow': '#583660', '--card-eyebrow': '#fff3f5', '--card-outline': '#ffd4a8', '--pill': '#ffd4a8', '--pill-text': '#0f0c1a', '--pill-hover': '#ffc080', '--pill-active': '#ffa74d', '--focal': '62%' },
  },
  {
    href: LINKS.afterHours,
    img: afterHours,
    theme: THEME.afterHours,
    vars: { '--card-bg': '#243152', '--card-glow': '#273c5c', '--card-eyebrow': '#cdfaea', '--card-outline': '#e6ffa3', '--pill': '#e6ffa3', '--pill-text': '#0d0c1a', '--pill-hover': '#e1fa9e', '--pill-active': '#d6f485', '--focal': '22%' },
  },
  {
    href: LINKS.caseStudy,
    img: theHeist,
    theme: THEME.caseStudy,
    vars: { '--card-bg': '#162623', '--card-glow': '#243830', '--card-eyebrow': '#e1e7c7', '--card-outline': '#ffdf9e', '--pill': '#ffdf9e', '--pill-text': '#0d0c1a', '--pill-hover': '#fbd383', '--pill-active': '#f6c76a', '--focal': '72%' },
  },
  {
    href: LINKS.aboutMe,
    img: offTheClock,
    theme: THEME.offTheClock,
    vars: { '--card-bg': '#2c3868', '--card-glow': '#324275', '--card-eyebrow': '#e9fbff', '--card-outline': '#ffc5b8', '--pill': '#ffc5b8', '--pill-text': '#0d0c1a', '--pill-hover': '#fcae9c', '--pill-active': '#f79882', '--focal': '45%' },
  },
]

export default function Highlights() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    let cleanCards
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.card', root.current)
      cards.forEach((card, i) => themeStep(card, i ? CARDS[i - 1].theme : THEME.base, CARDS[i].theme))
      cleanCards = cardMotion(root.current)
    }, root)
    return () => {
      cleanCards?.()
      ctx.revert()
    }
  }, [])

  return (
    <section className="hl grid-section" ref={root} id="highlights" aria-labelledby="highlights-title">
      <h2 className="sr-only" id="highlights-title">
        Highlights
      </h2>
      {HIGHLIGHTS.map((h, i) => (
        <Card
          key={h.title}
          href={CARDS[i].href}
          variant="short"
          className={i % 2 ? 'card-end hl-card' : 'hl-card'}
          theme={CARDS[i].vars}
          img={CARDS[i].img}
          eyebrow={h.eyebrow}
          title={h.title}
          text={h.text}
          cta={h.button}
          follow
        />
      ))}
    </section>
  )
}
