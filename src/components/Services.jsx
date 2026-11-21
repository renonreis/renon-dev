import { useLayoutEffect, useRef } from 'react'
import cardShort from '../assets/site/services/card-short.avif'
import cardTallDesktop from '../assets/site/services/card-tall-desktop.avif'
import cardTallMobile from '../assets/site/services/card-tall-mobile.avif'
import { LINKS, SERVICES } from '../content.js'
import { cardMotion } from '../lib/cards.js'
import { scrubVideo, SERVICES_FPS, SERVICES_FRAMES } from '../lib/hosted-media.js'
import { useMedia, useScrubClip } from '../lib/hooks.js'
import { gsap, prefersReducedMotion } from '../lib/scroll.js'
import Card from './Card.jsx'

const PHONE = '(max-width: 767.98px)'
const PHONE_PORTRAIT = '(max-width: 767.98px) and (orientation: portrait)'
const CLIP = scrubVideo('services')

// Live card themes (computed theme variables on the live Ultimate Edition cards).
const THEMES = [
  {
    '--card-bg': '#4b2f54',
    '--card-glow': '#583660',
    '--card-eyebrow': '#fff3f5',
    '--card-outline': '#ffd4a8',
    '--pill': '#ffd4a8',
    '--pill-text': '#0f0c1a',
    '--pill-hover': '#ffc080',
    '--pill-active': '#ffa74d',
  },
  {
    '--card-bg': '#243152',
    '--card-glow': '#273c5c',
    '--card-eyebrow': '#b8f0ea',
    '--card-outline': '#e6ffa3',
    '--pill': '#e6ffa3',
    '--pill-text': '#0d0c1a',
    '--pill-hover': '#e1fa9e',
    '--pill-active': '#d6f485',
  },
]

export default function Services() {
  const root = useRef(null)
  const portrait = useMedia(PHONE_PORTRAIT)
  const clip = portrait ? CLIP.portrait : CLIP.landscape
  // The 34-frame clip plays between the end of the fade-in and the start of the fade-out, holding
  // its first and last frames either side, so each frame gets ~37px of scroll at 1440 instead of
  // stepping every ~80px.
  const { video, frame, seek } = useScrubClip(clip.video, SERVICES_FRAMES, SERVICES_FPS)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const q = gsap.utils.selector(root)
    const [wrap] = q('.svc-wrap')
    const [layer] = q('.svc-layer')
    const [cards] = q('.svc-cards')
    const [glowDiv] = q('.svc-glow')
    const glow = document.querySelector('.cursor-glow-fade')
    const defaults = { duration: 100, ease: 'none' }
    let cleanCards
    // Live Ultimate Edition timelines (units and eases as on live). The cursor glow wrapper's
    // opacity 1 is live's .5.
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults,
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            endTrigger: cards,
            end: 'top top',
            pin: true,
            pinSpacing: false,
            scrub: true,
          },
        })
        .fromTo(layer, { scale: 1 }, { scale: 1.1 })

      const fadeIn = gsap
        .timeline({ defaults, scrollTrigger: { trigger: wrap, start: 'top top+=25%', end: '+=100%', scrub: true } })
        .fromTo(wrap, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power3.in' }, 0)
        .fromTo(wrap, { filter: 'brightness(0.2)' }, { filter: 'brightness(1)', ease: 'power1.in', duration: 61 }, 0)

      const fadeOut = gsap
        .timeline({
          defaults,
          scrollTrigger: {
            trigger: cards,
            start: () => (window.matchMedia(PHONE).matches ? 'top bottom-=40%' : 'top bottom-=20%'),
            end: 'top top',
            scrub: true,
          },
        })
        .to(wrap, { opacity: 0 }, 0)
        .to(wrap, { filter: 'brightness(0.2)', duration: 20 }, 80)
        .to(glowDiv, { opacity: 0, duration: 20 }, 80)

      gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top+=25%',
          endTrigger: cards,
          end: 'top top',
          scrub: true,
          onRefresh: (self) => {
            const range = self.end - self.start || 1
            frame.current.from = (fadeIn.scrollTrigger.end - self.start) / range
            frame.current.to = (fadeOut.scrollTrigger.start - self.start) / range
          },
          onUpdate: (self) => {
            frame.current.progress = self.progress
            seek()
          },
        },
      })

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

      // Live theme system: the page colour and the cursor glow's colour shift to this section's
      // theme as it scrolls in (top bottom → top top).
      gsap.fromTo(
        document.documentElement,
        { '--page-bg': 'rgb(12, 13, 27)', '--spot': 'rgb(31, 31, 56)' },
        {
          '--page-bg': 'rgb(24, 24, 45)',
          '--spot': 'rgb(47, 46, 82)',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true },
        },
      )

      cleanCards = cardMotion(cards)
    }, root)
    return () => {
      cleanCards?.()
      ctx.revert()
    }
  }, [frame, seek])

  const [rescue, builds] = SERVICES.cards
  return (
    <section className="svc" ref={root} id="services" aria-label="Services">
      <div className="svc-wrap" aria-hidden="true">
        <div className="svc-media">
          <div className="svc-layer">
            <picture className="svc-poster">
              <source media={PHONE_PORTRAIT} srcSet={CLIP.portrait.poster} />
              <img src={CLIP.landscape.poster} alt="" decoding="async" />
            </picture>
            <video
              className="svc-video"
              ref={video}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              onLoadedMetadata={seek}
            />
          </div>
        </div>
      </div>
      <div className="svc-glow-row" aria-hidden="true">
        <div className="svc-glow" />
      </div>
      <div className="svc-cards grid-section">
        <Card
          href={LINKS.servicesIncluded}
          variant="tall"
          className="card-end"
          theme={THEMES[0]}
          sources={[{ media: PHONE, src: cardTallMobile }]}
          img={cardTallDesktop}
          title={rescue.title}
          text={rescue.text}
          cta={rescue.button}
        />
        <Card
          href={LINKS.startProject}
          variant="short"
          className="card-end"
          theme={THEMES[1]}
          img={cardShort}
          eyebrow={builds.eyebrow}
          title={builds.title}
          text={builds.text}
          cta={builds.button}
          follow
        />
      </div>
    </section>
  )
}
