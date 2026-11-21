// Hero artwork, grouped by set, plus the preload the loader waits for.
const desktopFiles = import.meta.glob('../assets/site/hero/desktop/*.avif', { eager: true, import: 'default' })
const mobileFiles = import.meta.glob('../assets/site/hero/mobile/*.avif', { eager: true, import: 'default' })

function heroSet(files, dir) {
  const get = (name) => files[`../assets/site/hero/${dir}/${name}.avif`]
  const shards = Array.from({ length: 10 }, (_, i) => get(`shard-${String(i + 1).padStart(2, '0')}`))
  return {
    // Same order as the live intro's 12 layers: ten pieces, then VI, then the wordmark.
    layers: [...shards, get('logo-vi'), get('logo-gta')],
    shards,
    posterLogo: get('poster-logo'),
  }
}

export const HERO_MEDIA = {
  desktop: heroSet(desktopFiles, 'desktop'),
  mobile: heroSet(mobileFiles, 'mobile'),
}

// Square art for square and portrait frames, 16:9 art for wide ones (live switches at 1:1).
export const SQUARE = '(max-aspect-ratio: 1/1)'
export const currentHeroSet = () => (window.matchMedia(SQUARE).matches ? HERO_MEDIA.mobile : HERO_MEDIA.desktop)

const cache = new Map()
export function loadImage(url) {
  if (!cache.has(url)) {
    const img = new Image()
    img.src = url
    cache.set(
      url,
      img.decode().then(
        () => img,
        () => img,
      ),
    )
  }
  return cache.get(url)
}

// Live gives up waiting after NEXT_PUBLIC_LOAD_TIMEOUT = 15000 ms.
const LOAD_TIMEOUT = 15000

let ready
export function whenHeroReady() {
  if (!ready) {
    const set = currentHeroSet()
    const all = Promise.all([document.fonts.ready, ...[...set.layers, set.posterLogo].map(loadImage)])
    ready = Promise.race([all, new Promise((resolve) => setTimeout(resolve, LOAD_TIMEOUT))])
  }
  return ready
}
