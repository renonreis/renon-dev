import { useCallback, useLayoutEffect, useRef } from 'react'
import post1 from '../assets/site/blog/post-1.avif'
import post2 from '../assets/site/blog/post-2.avif'
import post3 from '../assets/site/blog/post-3.avif'
import { BLOG, LINKS } from '../content.js'
import { useCarousel } from '../lib/hooks.js'
import { gsap, prefersReducedMotion } from '../lib/scroll.js'
import { THEME, themeStep } from '../lib/theme.js'
import Pager from './Pager.jsx'
import SectionHeader from './SectionHeader.jsx'

const PHONE_PORTRAIT = '(max-width: 767.98px) and (orientation: portrait)'
const ART = [post1, post2, post3]

// Blog (live Featured News `_10vlklc*`, cards `_1af9x9y*`): three posts in a row, a carousel on
// portrait phones. Titles are painted into the covers, so the alt text stays empty.
export default function Blog() {
  const root = useRef(null)
  const carousel = useRef(null)
  const perPage = useCallback(() => (window.matchMedia(PHONE_PORTRAIT).matches ? 1 : BLOG.posts.length), [])
  const { pages, page } = useCarousel(carousel, BLOG.posts.length, perPage)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => themeStep(root.current, THEME.clients, THEME.base), root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="blog grid-section row-section" ref={root} id="blog" aria-labelledby="blog-title">
      <SectionHeader id="blog-title" title={BLOG.header} link={BLOG.link} href={LINKS.blog} />
      <div className="carousel blog-carousel" ref={carousel}>
        <ul className="carousel-track" role="list">
          {BLOG.posts.map((post, i) => (
            <li className="carousel-slide blog-slide" key={post.title}>
              <a className="post" href={LINKS.posts[i]}>
                <span className="post-media">
                  <img src={ART[i]} alt="" width="1672" height="941" loading="lazy" decoding="async" />
                </span>
                <span className="post-body">
                  <span className="post-title" role="heading" aria-level={3}>
                    {post.title}
                  </span>
                  <span className="post-date">
                    {post.date}
                    {post.sample && ' · Sample'}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <Pager pages={pages} page={page} />
    </section>
  )
}
