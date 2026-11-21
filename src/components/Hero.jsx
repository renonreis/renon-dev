import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HERO, LINKS, PAGE } from '../content.js'
import { buildLayerTimeline, INTRO, IntroCanvas } from '../lib/hero-intro.js'
import { currentHeroSet, HERO_MEDIA, loadImage, SQUARE } from '../lib/hero-media.js'
import { gsap, prefersReducedMotion as reducedMotion } from '../lib/scroll.js'

const PHONE = '(max-width: 767.98px)'

function Chevron({ className }) {
  return (
    <svg className={className} viewBox="0 0 34 14" fill="none" aria-hidden="true" focusable="false">
      <path d="M2.5 2.5 17 11.5l14.5-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Tagline({ className = '' }) {
  return (
    <p className={`hero-text ${className}`}>
      <span className="hero-title">{HERO.tagline[0]}</span>
      <span className="hero-subtitle">{HERO.tagline[1]}</span>
    </p>
  )
}

export default function Hero({ play = false, onIntroDone }) {
  const root = useRef(null)
  const canvasRef = useRef(null)
  const frameRef = useRef(null)
  const intro = useRef(null)
  const [skipIntro] = useState(reducedMotion)
  const [introDone, setIntroDone] = useState(skipIntro)

  // Builds the paused intro (canvas layers + outer hero timeline, live values) and hides
  // everything it reveals. Runs under the loader, so nothing flashes.
  useLayoutEffect(() => {
    if (skipIntro) return
    const q = gsap.utils.selector(root)
    const ctx = gsap.context(() => {
      const { layers, timeline: tl } = buildLayerTimeline({
        onUpdate: () => intro.current?.draw(layers),
      })
      const D = INTRO.duration
      const frames = (n) => (n / INTRO.totalFrames) * D
      const ui = frames(81)
      const nav = document.querySelector('.nav')
      const glow = document.querySelector('.cursor-glow')
      const overlay = document.querySelector('.bg-overlay')
      const finals = [q('.hero-collage'), q('.hero-logo'), document.querySelector('.scroll-cue')]

      gsap.set(finals, { autoAlpha: 0 })
      gsap.set(root.current, { pointerEvents: 'none' })
      tl.from(q('.hero-stack'), { scale: 1.4286, duration: frames(190), ease: 'power2.inOut' }, 0)
      tl.from(q('.hero-stack'), { autoAlpha: 0, duration: D / 2, ease: 'power1.in' }, 0)
      tl.addLabel('button', D)
      tl.fromTo(q('.hero-button'), { autoAlpha: 0 }, { autoAlpha: 1, duration: frames(42), ease: 'power1.in' }, 'button')
      tl.addLabel('heroUI', D)
      tl.fromTo(
        [nav, ...q('.hero-text'), ...q('.hero-tags'), ...q('.hero-disclaimer')],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: ui, ease: 'power1.inOut' },
        'heroUI',
      )
      if (glow && !window.matchMedia('(pointer: coarse)').matches) {
        tl.fromTo(glow, { opacity: 0 }, { opacity: 0.5, duration: ui, ease: 'power1.inOut' }, 'heroUI')
      }
      if (overlay) {
        tl.from(overlay, { background: '#0C0D1B', duration: D - INTRO.shardFadeInDelay, ease: 'none' }, INTRO.shardFadeInDelay)
      }
      // Swap the canvas for the static collage, logo and scroll cue.
      tl.call(() => {
        gsap.to(finals, {
          autoAlpha: 1,
          duration: 0.5,
          ease: 'sine.inOut',
          onComplete: () => setIntroDone(true),
        })
      })
      intro.current = { timeline: tl, layers }
    }, root)
    intro.current.ctx = ctx
    return () => {
      ctx.revert()
      intro.current = null
    }
  }, [skipIntro])

  // After the swap: drop the intro's inline styles (all at their resting values) and the canvas,
  // before the scroll-out below records its start values.
  useLayoutEffect(() => {
    if (!introDone) return
    intro.current?.ctx.revert()
    intro.current = null
  }, [introDone])

  // Scroll-out (live: built once the intro is over). Timeline units are the live ones: 180 over
  // one hero height, the hero pinned without spacing so the next section rises behind it.
  useLayoutEffect(() => {
    if (!introDone) return
    const q = gsap.utils.selector(root)
    const ctx = gsap.context(() => {
      const pill = document.querySelector('.nav-pill')
      gsap.fromTo(
        pill,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: skipIntro ? 0 : 0.3,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: q('.hero-col')[0], start: 'top top-=40%', toggleActions: 'play none none reverse' },
        },
      )
      if (skipIntro) return

      const cue = document.querySelector('.scroll-cue')
      const button = q('.hero-button')[0]
      const tl = gsap.timeline({
        defaults: { duration: 100, ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          pin: true,
          pinSpacing: false,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      tl.to(cue, { autoAlpha: 0, duration: 40, ease: 'circ.out' }, 0)
      tl.to(root.current, { scale: () => (window.matchMedia(PHONE).matches ? 0.85 : 0.9) }, 0)
      tl.to([q('.hero-info'), q('.hero-text-top'), q('.hero-collage'), q('.hero-disclaimer')], {
        autoAlpha: 0,
        duration: 70,
        ease: 'power3.out',
      }, 50)
      tl.set([root.current, q('.hero-col')], { pointerEvents: 'none' }, 50)
      tl.to(q('.hero-logo'), {
        autoAlpha: 0,
        duration: 130,
        ease: 'power3.out',
        onStart: () => gsap.set(button, { pointerEvents: 'none' }),
        onReverseComplete: () => gsap.set(button, { pointerEvents: 'auto' }),
      }, 50)

      // Fixed cue: idle bob, gone once the hero's bottom passes the fold.
      const chevron = cue.querySelector('svg')
      const bob = gsap.fromTo(
        chevron,
        { opacity: 1, scale: 1, y: 0 },
        { opacity: 0.7, scale: 0.9, y: 4, yoyo: true, repeat: -1, duration: 0.8, ease: 'power1.inOut' },
      )
      const hide = gsap.fromTo(chevron, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, ease: 'power1.out', paused: true })
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'bottom bottom',
          end: 'bottom top',
          onEnter: () => {
            bob.pause()
            hide.play()
          },
          onLeaveBack: () => {
            hide.reverse()
            bob.resume()
          },
        },
      })

      // Button pulse; hover/focus hand it back to CSS, dim the collage, press squeezes the glow.
      const pulse = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 1.75, ease: 'sine.inOut' } })
      pulse.fromTo(
        button,
        { boxShadow: '0 2px 50px 0 rgba(255,178,198,.15)', color: '#2D2B4F', background: '#ffb0c4' },
        { boxShadow: '0 2px 75px 0 hsla(344,100%,85%,.45)', color: '#693C56', background: '#FED6E3' },
      )
      const stopPulse = () => {
        pulse.pause()
        gsap.set(button, { clearProps: 'boxShadow,color,background' })
      }
      const dim = gsap.to(q('.hero-collage picture'), { opacity: 0.6, duration: 0.5, ease: 'sine.inOut', paused: true })
      const glow = document.querySelector('.cursor-glow')
      const squeeze = glow && gsap.to(glow, { scaleX: 0.6, scaleY: 0.4, filter: 'brightness(1.3)', duration: 0.4, ease: 'sine.inOut', paused: true })
      const enter = () => {
        stopPulse()
        dim.play()
      }
      const leave = () => {
        pulse.restart()
        dim.reverse()
        squeeze?.reverse()
      }
      const down = () => {
        stopPulse()
        squeeze?.play()
      }
      const up = () => {
        pulse.restart()
        squeeze?.reverse()
      }
      const events = { mouseenter: enter, focusin: enter, mouseleave: leave, focusout: leave, mousedown: down, mouseup: up }
      Object.entries(events).forEach(([type, fn]) => button.addEventListener(type, fn))
      return () => Object.entries(events).forEach(([type, fn]) => button.removeEventListener(type, fn))
    }, root)
    return () => ctx.revert()
  }, [introDone, skipIntro])

  useEffect(() => {
    if (play && introDone) onIntroDone?.()
  }, [play, introDone, onIntroDone])

  useEffect(() => {
    const current = intro.current
    if (!play || !current) return
    let alive = true
    let observer
    Promise.all(currentHeroSet().layers.map(loadImage)).then((images) => {
      if (!alive || intro.current !== current) return
      const view = new IntroCanvas(canvasRef.current, frameRef.current, images)
      current.draw = (layers) => view.draw(layers)
      observer = new ResizeObserver(() => {
        if (!canvasRef.current) return observer.disconnect()
        view.resize()
        view.draw(current.layers)
      })
      observer.observe(canvasRef.current)
      current.timeline.play()
    })
    return () => {
      alive = false
      observer?.disconnect()
    }
  }, [play])

  return (
    <>
      <section className="hero" id="top" ref={root}>
        <div className="hero-col">
          <div className="hero-stack">
            <Tagline className="hero-text-top" />
            <div className="hero-frame" ref={frameRef}>
              {!introDone && <canvas className="hero-intro" ref={canvasRef} aria-hidden="true" />}
              {/* The collage is the ten pieces stacked, each on a full-size transparent canvas. */}
              <div className="hero-collage">
                {HERO_MEDIA.desktop.shards.map((src, i) => (
                  <picture key={src}>
                    <source media={SQUARE} srcSet={HERO_MEDIA.mobile.shards[i]} width={1366} height={1366} />
                    <img src={src} width={2560} height={1440} alt="" fetchPriority="high" />
                  </picture>
                ))}
              </div>
              <h1 className="hero-logo">
                <picture>
                  <source media={SQUARE} srcSet={HERO_MEDIA.mobile.posterLogo} width={1366} height={1366} />
                  <img src={HERO_MEDIA.desktop.posterLogo} width={2560} height={1440} alt={PAGE.logoAlt} fetchPriority="high" />
                </picture>
              </h1>
            </div>
            <div className="hero-info">
              <div className="hero-info-row">
                <Tagline />
                <a href={LINKS.hireMe} className="pill pill-lg hero-button">
                  {HERO.button}
                </a>
                <ul className="hero-tags">
                  {HERO.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p className="hero-disclaimer">{HERO.disclaimer}</p>
        {skipIntro && <Chevron className="hero-cue" />}
      </section>
      {/* Fixed scroll cue (live: one per page, outside the scaled hero). */}
      {!skipIntro && (
        <div className="scroll-cue">
          <Chevron />
        </div>
      )}
    </>
  )
}
