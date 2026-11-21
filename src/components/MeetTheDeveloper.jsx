import { useLayoutEffect, useRef } from 'react'
import card1 from '../assets/site/meet-the-developer/card-1.avif'
import card2 from '../assets/site/meet-the-developer/card-2.avif'
import card3 from '../assets/site/meet-the-developer/card-3.avif'
import featuredDesktop from '../assets/site/meet-the-developer/featured-desktop.avif'
import featuredMobile from '../assets/site/meet-the-developer/featured-mobile.avif'
import scene from '../assets/site/meet-the-developer/scene.avif'
import { LINKS, MEET_THE_DEVELOPER as MTD } from '../content.js'
import { cardMotion } from '../lib/cards.js'
import { useCarousel } from '../lib/hooks.js'
import Pager from './Pager.jsx'
import { gsap, prefersReducedMotion } from '../lib/scroll.js'
import Card, { PlayGlyph } from './Card.jsx'

const PHONE = '(max-width: 767.98px)'
const PHONE_PORTRAIT = '(max-width: 767.98px) and (orientation: portrait)'
const NO_CAROUSEL = '(min-width: 1280px)'

// Per-card themes, read from the live cards' computed theme variables (AGENTS.md › Findings).
const FEATURED_THEME = {
  '--card-bg': '#38365d',
  '--card-glow': '#433f6a',
  '--card-eyebrow': '#fbf4ff',
  '--card-outline': '#ffb2c6',
  '--pill': '#fdfbff',
  '--pill-text': '#070810',
  '--pill-hover': '#fc97b1',
  '--pill-active': '#f77e9c',
}
const PROJECT_THEMES = [
  { '--card-bg': '#252644', '--card-glow': '#2f2e52', '--card-eyebrow': '#f1eaff', '--card-outline': '#ffb2c6' },
  { '--card-bg': '#21254c', '--card-glow': '#262e5b', '--card-eyebrow': '#d9f3fe', '--card-outline': '#ffc5b8' },
  { '--card-bg': '#31223e', '--card-glow': '#3f284b', '--card-eyebrow': '#fee8ea', '--card-outline': '#ffd4a8' },
]
const PROJECT_ART = [card1, card2, card3]

// 2 cards per page from 768px, 1 on portrait phones, carousel off from 1280px.
const perPage = () =>
  window.matchMedia(NO_CAROUSEL).matches ? MTD.projects.length : window.matchMedia(PHONE_PORTRAIT).matches ? 1 : 2

export default function MeetTheDeveloper() {
  const root = useRef(null)
  const carousel = useRef(null)
  const reveal = useRef(null)
  const { pages, page } = useCarousel(carousel, MTD.projects.length, perPage)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const q = gsap.utils.selector(root)
    const [featured] = q('.mtd-featured')
    const [cards] = q('.mtd-cards')
    const [bgWrap] = q('.mtd-bg')
    const [pic] = q('.mtd-bg picture')
    const [content] = q('.mtd-content')
    const [text] = q('.mtd-text')
    const [play] = q('.mtd-play')
    const glow = document.querySelector('.cursor-glow-fade')
    const defaults = { duration: 100, ease: 'none' }
    let cleanCards
    // Live Launch Trailer timelines (units and eases as on live). The cursor glow wrapper's
    // opacity 1 is live's .5.
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults,
          scrollTrigger: {
            trigger: featured,
            start: 'top top',
            endTrigger: cards,
            end: 'top top',
            pin: true,
            pinSpacing: false,
            scrub: true,
          },
        })
        .fromTo(pic, { scale: 1.2 }, { scale: 1 }, 0)
        .fromTo(content, { scale: 1.05 }, { scale: 0.9 }, 0)

      reveal.current = gsap
        .timeline({ defaults, scrollTrigger: { trigger: featured, start: 'top top', end: '+=100%', scrub: true } })
        .fromTo(bgWrap, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power3.in' }, 0)
        .fromTo(bgWrap, { filter: 'brightness(0.2)' }, { filter: 'brightness(1)', ease: 'power1.in', duration: 61 }, 0)
        .fromTo(play, { opacity: 0, pointerEvents: 'none' }, { opacity: 1, pointerEvents: 'all', ease: 'sine.in', duration: 40 }, 70)
        .fromTo(text, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power3.in', duration: 70 }, 30)
        .fromTo(glow, { opacity: 1 }, { opacity: 0, immediateRender: false, duration: 61 }, 0)

      gsap
        .timeline({ defaults, scrollTrigger: { trigger: cards, start: 'top bottom', end: 'top top', scrub: true } })
        .to(play, { opacity: 0, pointerEvents: 'none', ease: 'sine.out', duration: 60 }, 10)
        .to(bgWrap, { autoAlpha: 0, duration: 80 }, 0)
        .to(text, { opacity: 0 }, 0)

      gsap.fromTo(
        glow,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: cards, start: 'top bottom+=25%', end: 'top bottom', scrub: true },
        },
      )
      gsap.to(glow, {
        opacity: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: cards, start: 'bottom center-=40%', end: '+=20%', scrub: true },
      })

      cleanCards = cardMotion(cards)
    }, root)
    return () => {
      cleanCards?.()
      ctx.revert()
      reveal.current = null
    }
  }, [])

  // Keyboard users can reach the Play button before the scene has faded in: bring it into view.
  const showScene = () => {
    const st = reveal.current?.scrollTrigger
    if (st && (window.scrollY < st.end || window.scrollY > st.end + window.innerHeight)) window.scrollTo(0, st.end)
  }

  return (
    <div className="mtd" ref={root} id="meet-the-developer">
      <div className="mtd-featured">
        <div className="mtd-content">
          <div className="mtd-text">
            <p className="mtd-eyebrow">{MTD.scene.eyebrow}</p>
            <h2 className="mtd-title">{MTD.scene.title}</h2>
          </div>
          <a className="mtd-play" href={LINKS.meetTheDeveloper} aria-label={`${MTD.scene.play}: ${MTD.scene.title}`} onFocus={showScene}>
            <PlayGlyph />
          </a>
        </div>
        <div className="mtd-bg">
          <picture>
            <img src={scene} alt="" width="1672" height="858" decoding="async" />
          </picture>
        </div>
      </div>

      <div className="mtd-cards grid-section">
        <Card
          href={LINKS.rideAlong}
          variant="short"
          className="card-featured"
          theme={FEATURED_THEME}
          sources={[{ media: PHONE, src: featuredMobile }]}
          img={featuredDesktop}
          eyebrow={MTD.featured.eyebrow}
          title={MTD.featured.title}
          cta={MTD.featured.button}
          ctaIcon="play"
          follow
        />
        <div className="carousel mtd-carousel" ref={carousel}>
          <div className="carousel-track">
            {MTD.projects.map((p, i) => (
              <div className="carousel-slide mtd-slide" key={p.title}>
                <Card
                  href={LINKS.projects[i]}
                  variant="half"
                  theme={PROJECT_THEMES[i]}
                  img={PROJECT_ART[i]}
                  eyebrow={p.sample ? `${p.eyebrow} · Sample` : p.eyebrow}
                  title={p.title}
                  play
                />
              </div>
            ))}
          </div>
        </div>
        <Pager pages={pages} page={page} />
      </div>
    </div>
  )
}
