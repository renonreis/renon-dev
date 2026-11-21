import { useLayoutEffect, useRef } from 'react'
import { CITY } from '../content.js'
import { useMedia, useScrubClip } from '../lib/hooks.js'
import { CITY_FPS, CITY_FRAMES, scrubVideo } from '../lib/hosted-media.js'
import { gsap, prefersReducedMotion } from '../lib/scroll.js'

const PHONE = '(max-width: 767.98px)'
const PHONE_PORTRAIT = '(max-width: 767.98px) and (orientation: portrait)'
const CLIP = scrubVideo('city')

export default function City() {
  const root = useRef(null)
  const portrait = useMedia(PHONE_PORTRAIT)
  const clip = portrait ? CLIP.portrait : CLIP.landscape
  // Live spends the first quarter of the pin on near-invisible frames, so the 149-frame clip plays
  // over 25% → 95% of the pin (~14.5px of scroll per frame at 1440; live 12.8).
  const { video, frame, seek } = useScrubClip(clip.video, CITY_FRAMES, CITY_FPS, { from: 0.25, to: 0.95 })

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const q = gsap.utils.selector(root)
    const [wrap] = q('.city-wrap')
    const [layer] = q('.city-layer')
    const [text] = q('.city-text')
    const glow = document.querySelector('.cursor-glow-fade')
    const phone = () => window.matchMedia(PHONE).matches
    const defaults = { duration: 100, ease: 'none' }

    // Live Vice City timelines ("back-of-box"). The cursor glow wrapper's opacity 1 is live's .5.
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults,
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            endTrigger: text,
            end: 'top top',
            pin: true,
            pinSpacing: false,
            scrub: true,
            onUpdate: (self) => {
              frame.current.progress = self.progress
              seek()
            },
          },
        })
        .fromTo(layer, { scale: 1 }, { scale: 1.1 })

      gsap.fromTo(
        wrap,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          ease: 'power3.in',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => (phone() ? '+=100%' : '+=150%'),
            scrub: true,
          },
        },
      )

      // The video goes dark from the bottom up as a shrinking radial mask moves upwards, then fades.
      gsap
        .timeline({
          defaults,
          scrollTrigger: {
            trigger: text,
            start: () => (phone() ? 'top-=150% bottom' : 'top-=90% bottom'),
            end: 'top top',
            scrub: true,
          },
        })
        .fromTo(
          wrap,
          {
            maskImage: phone()
              ? 'radial-gradient(250% 150% at 50% 50%, #000 100%, rgba(0, 0, 0, 0.5) 150%)'
              : 'radial-gradient(150% 150% at 50% 50%, #000 100%, rgba(0, 0, 0, 0.5) 150%)',
          },
          {
            maskImage: phone()
              ? 'radial-gradient(200% 100% at 50% -40%, #000 50%, rgba(0, 0, 0, 0.25) 90%)'
              : 'radial-gradient(100% 100% at 50% -50%, #000 50%, rgba(0, 0, 0, 0.25) 90%)',
            ease: 'power1.out',
            immediateRender: false,
          },
          0,
        )
        .to(wrap, { autoAlpha: 0, duration: 50, immediateRender: false }, 50)

      gsap.fromTo(
        glow,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: text, start: 'top bottom', end: '+=30%', scrub: true },
        },
      )

      gsap
        .timeline({
          defaults,
          scrollTrigger: { trigger: text, start: 'top bottom', end: 'bottom top', scrub: true },
        })
        .fromTo(
          text,
          { backgroundImage: 'linear-gradient(0deg, #99743d -10%, #ad4556 90%)', filter: 'brightness(0.8)' },
          { backgroundImage: 'linear-gradient(0deg, #fec497 10%, #e9639b 100%)', filter: 'brightness(1)', duration: 50 },
        )
        .to(text, { backgroundImage: 'linear-gradient(0deg, #99c7fe 30%, #d263e9 110%)', duration: 50 })

      // Back to the base theme as the section arrives (live [data-theme] marker, linear).
      gsap.fromTo(
        document.documentElement,
        { '--page-bg': 'rgb(24, 24, 45)', '--spot': 'rgb(47, 46, 82)' },
        {
          '--page-bg': 'rgb(12, 13, 27)',
          '--spot': 'rgb(31, 31, 56)',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [frame, seek])

  return (
    <section className="city" ref={root} id="city" aria-labelledby="city-title">
      <div className="city-wrap" aria-hidden="true">
        <div className="city-media">
          <div className="city-layer">
            <picture className="city-poster">
              <source media={PHONE_PORTRAIT} srcSet={CLIP.portrait.poster} />
              <img src={CLIP.landscape.poster} alt="" decoding="async" loading="lazy" />
            </picture>
            <video
              className="city-video"
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
      <div className="city-text">
        <h2 className="city-title" id="city-title">
          {CITY.title}
        </h2>
        <p className="city-bio">{CITY.bio}</p>
      </div>
    </section>
  )
}
