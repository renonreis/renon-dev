import { useCallback, useEffect, useRef, useState } from 'react'
import Backdrop from './components/Backdrop.jsx'
import Blog from './components/Blog.jsx'
import City from './components/City.jsx'
import Clients from './components/Clients.jsx'
import Footer from './components/Footer.jsx'
import Highlights from './components/Highlights.jsx'
import Hero from './components/Hero.jsx'
import Loader from './components/Loader.jsx'
import MeetTheDeveloper from './components/MeetTheDeveloper.jsx'
import Navbar from './components/Navbar.jsx'
import Services from './components/Services.jsx'
import { createSmoothScroll, ScrollTrigger } from './lib/scroll.js'

export default function App() {
  // loading → intro (loader fading, intro playing behind it) → done (scroll unlocked)
  const [phase, setPhase] = useState('loading')
  const [loaderGone, setLoaderGone] = useState(false)
  const smooth = useRef(null)
  const startIntro = useCallback(() => setPhase((p) => (p === 'loading' ? 'intro' : p)), [])
  const removeLoader = useCallback(() => setLoaderGone(true), [])
  const finishIntro = useCallback(() => setPhase('done'), [])

  // The intro is built for the top of the page.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    smooth.current = createSmoothScroll()
    return () => {
      smooth.current?.destroy()
      smooth.current = null
    }
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const done = phase === 'done'
    html.style.overflow = done ? '' : 'hidden'
    if (done) {
      smooth.current?.lenis.start()
      ScrollTrigger.refresh()
    } else {
      smooth.current?.lenis.stop()
    }
    return () => {
      html.style.overflow = ''
    }
  }, [phase])

  return (
    <>
      <Backdrop />
      {!loaderGone && <Loader onFadeout={startIntro} onDone={removeLoader} />}
      {/* Nothing behind the loader can take focus until it's gone. */}
      <div className="contents" inert={!loaderGone}>
        <Navbar />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero play={phase !== 'loading'} onIntroDone={finishIntro} />
          <MeetTheDeveloper />
          <Services />
          <City />
          <Highlights />
          <Clients />
          <Blog />
        </main>
        <Footer />
      </div>
    </>
  )
}
