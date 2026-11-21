// Canvas intro of the hero: twelve layers fly in from depth, then the logo appears. Ported from the
// live site's intro (draw loop, layer state and per-breakpoint timelines); see AGENTS.md › Findings.
import { gsap } from 'gsap'

export const INTRO = {
  duration: 2.6, // HeroEnterDuration
  totalFrames: 140,
  shardFadeInDelay: 0.5571428571428572,
}
const INK = '#0C0D1B'
const PERSPECTIVE = 5000

const BREAKPOINTS = {
  fobSquare: '(min-aspect-ratio: 0.6) and (max-aspect-ratio: 1)',
  fobPortrait: '(max-aspect-ratio: 0.6)',
  fobUltrawide: '(min-aspect-ratio: 2.25), (max-width: 767.98px) and (min-aspect-ratio: 2)',
}

const REVEAL_DELAYS = [0.4642857142857143, 0.5571428571428572, 0.65, 0.7428571428571429, 0.8357142857142859,
  0.9285714285714286, 1.0214285714285714, 1.1142857142857143, 1.2071428571428573]
// Pieces in list order: [layer object, start z]. As on live, list position i also picks the image
// (shard i) and the draw order, so in effect shard i starts at the i-th z.
const SQUARE_PIECES = [[1, -4314], [6, -5486], [4, -6533], [3, -7759], [2, -8923], [0, -10080], [7, -11246],
  [5, -12331], [8, -13335]]
const WIDE_PIECES = [[1, -4314], [0, -5337], [7, -6533], [5, -7760], [2, -9177], [6, -9440], [8, -19197],
  [3, -15243], [4, -16634]]
const CONFIGS = {
  fobSquare: { pieces: SQUARE_PIECES, maskDuration: 2.1357142857142857 },
  fobPortrait: { pieces: SQUARE_PIECES, maskDuration: 2.1357142857142857 },
  fobUltrawide: { pieces: WIDE_PIECES, maskDuration: 1.4857142857142858 },
  default: { pieces: WIDE_PIECES, maskDuration: 2.1357142857142857 },
}

class Layer {
  x = 0
  y = 0
  z = 0
  scale = 1
  alpha = 1
  reveal = 0
  visible = true
  shadowColor = 'rgba(0,0,0,0)'
  shadowOpacity = 0
  shadowBlur = 0
  shadowX = 0
  shadowY = 0
  mask = 1
  maskSoftness = 200
  zIndex
  constructor(zIndex) {
    this.zIndex = zIndex
  }
}

function pickConfig() {
  const match = Object.keys(BREAKPOINTS).find((k) => window.matchMedia(BREAKPOINTS[k]).matches)
  return CONFIGS[match ?? 'default']
}

// Builds the layer timeline (paused). Timing and eases are the live values, in seconds.
export function buildLayerTimeline(vars) {
  const { pieces, maskDuration } = pickConfig()
  const layers = Array.from({ length: 12 }, (_, i) => new Layer(i))
  const tl = gsap.timeline({ paused: true, defaults: { duration: INTRO.duration, ease: 'power3.inOut' }, ...vars })
  const order = [
    ...pieces.map(([layer, z], i) => ({ layer, z, alpha: 0, revealDelay: REVEAL_DELAYS[i] })),
    { layer: 9, z: -13435, alpha: 0 }, // small centre piece behind the logo ("logoHole")
    { layer: 10, z: -13435, alpha: 0 }, // VI
    { layer: 11, z: -15853, alpha: 1 }, // wordmark
  ]
  const shards = order.slice(0, 9).map((o) => layers[o.layer])
  const [hole, vi, wordmark] = order.slice(9).map((o) => layers[o.layer])

  order.forEach((o, i) => {
    const layer = layers[o.layer]
    layer.zIndex = i
    layer.alpha = o.alpha
    tl.from(layer, { z: o.z }, 0)
    if (o.revealDelay != null) {
      tl.set(layer, { alpha: 0.5 }, INTRO.shardFadeInDelay)
      tl.from(layer, { reveal: 1, duration: INTRO.duration - o.revealDelay }, o.revealDelay)
    }
  })
  tl.to(vi, { alpha: 1, duration: 0.5571428571428572, ease: 'none' }, 1.6714285714285717)
  tl.fromTo(
    vi,
    { shadowColor: '#FFACFD', shadowOpacity: 0, shadowBlur: 18 },
    { shadowOpacity: 1, shadowBlur: 108, duration: 0.9285714285714284, ease: 'none' },
    2.0428571428571427,
  )
  tl.from(wordmark, { mask: 0, duration: maskDuration, ease: 'power1.out' }, 1.6714285714285717)
  tl.fromTo(
    wordmark,
    { shadowColor: '#FFD398', shadowOpacity: 0, shadowBlur: 15 },
    { shadowOpacity: 1, duration: 0.5571428571428572, ease: 'none' },
    2.4699999999999998,
  )
  tl.to(hole, { alpha: 1, duration: 0.4642857142857143, ease: 'sine.inOut' }, 2.4142857142857146)
  tl.to([vi, wordmark], { shadowOpacity: 0, duration: 1.1142857142857143, ease: 'power2.in' }, 3.0271428571428567)
  tl.addLabel('afterShardsLand', INTRO.duration)
  tl.to(shards, { alpha: 1, duration: 1.1142857142857143, ease: 'sine.inOut' }, 'afterShardsLand')
  return { layers, timeline: tl }
}

// Draws the layers onto the canvas. Live rasterises each image at a "logical" size (85vw wide,
// the frame's aspect) and a camera scales that onto the frame. We keep that geometry but rasterise
// each image once at the frame's device size and draw it 1:1 on the device grid when it lands, so
// the last frame matches the poster that replaces it.
export class IntroCanvas {
  constructor(canvas, frame, images) {
    this.canvas = canvas
    this.frame = frame
    this.images = images
    this.ctx = canvas.getContext('2d')
    this.work = document.createElement('canvas')
    this.workCtx = this.work.getContext('2d')
    this.workCtx.imageSmoothingEnabled = false
    this.bitmaps = []
    this.resize()
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const { canvas, frame } = this
    canvas.width = Math.round(canvas.clientWidth * dpr)
    canvas.height = Math.round(canvas.clientHeight * dpr)

    const ultrawide = window.matchMedia(BREAKPOINTS.fobUltrawide).matches
    const vw = document.documentElement.clientWidth
    const w = Math.round(ultrawide ? Math.min(0.85 * vw, 2560) : 0.85 * vw)
    // Unscaled, unrounded boxes: the canvas and frame sit inside the stack's intro scale, which
    // is centred on the stack.
    const rect = canvas.getBoundingClientRect()
    const scale = rect.width / canvas.clientWidth || 1
    const stack = frame.closest('.hero-stack')?.getBoundingClientRect() ?? rect
    const unscale = (v, c) => c + (v - c) / scale
    const box = frame.getBoundingClientRect()
    const bx = unscale(box.x, stack.x + stack.width / 2)
    const by = unscale(box.y, stack.y + stack.height / 2)
    const fw = box.width / scale
    const fh = box.height / scale
    this.camera = fw / w
    // Device px per logical px, and the landed image's device size.
    this.u = this.camera * dpr
    // Chrome paints the poster into its box snapped to whole device pixels.
    this.dest = [Math.round((bx + fw) * dpr) - Math.round(bx * dpr), Math.round((by + fh) * dpr) - Math.round(by * dpr)]
    // Centre the canvas on the frame at whole device pixels (no transform, so the compositor
    // doesn't resample it) and land the images where the browser draws the poster.
    const cl = Math.round((bx + (fw - canvas.clientWidth) / 2) * dpr)
    const ct = Math.round((by + (fh - canvas.clientHeight) / 2) * dpr)
    canvas.style.transform = 'none'
    canvas.style.left = `${cl / dpr - bx}px`
    canvas.style.top = `${ct / dpr - by}px`
    this.origin = [Math.round(bx * dpr) - cl, Math.round(by * dpr) - ct]
    const fit = [0, 0, ...this.dest]

    const k = Math.min(dpr, 2) / dpr
    const bw = Math.round(this.dest[0] * k)
    const bh = Math.round(this.dest[1] * k)
    this.k = bw / w
    const key = [bw, bh, ...fit].join()
    if (this.key === key) return
    this.key = key
    const [fx, fy, fdw, fdh] = fit.map((v) => v * (bw / this.dest[0]))
    this.bitmaps = this.images.map((img) => {
      const c = document.createElement('canvas')
      c.width = bw
      c.height = bh
      const g = c.getContext('2d')
      // 'low' downsamples like Chrome draws the poster <img>; 'high' comes out visibly softer.
      g.imageSmoothingQuality = 'low'
      const s = Math.max(fdw / img.naturalWidth, fdh / img.naturalHeight)
      const dw = img.naturalWidth * s
      const dh = img.naturalHeight * s
      g.drawImage(img, fx + (fdw - dw) / 2, fy + (fdh - dh) / 2, dw, dh)
      return c
    })
    this.work.width = bw
    this.work.height = bh
  }

  draw(layers) {
    const { ctx, canvas, bitmaps, work, workCtx: t, u } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const [f, p] = this.dest
    const W = work.width
    const H = work.height
    const [x0, y0] = this.origin
    const y = -f / 2
    const b = -p / 2
    for (const o of [...layers].sort((a, c) => a.zIndex - c.zIndex)) {
      if (!o.visible || o.alpha <= 0) continue
      const n = bitmaps[o.zIndex]
      const k = PERSPECTIVE / (PERSPECTIVE + Math.max(o.z, -(PERSPECTIVE - 1)))
      const c = o.scale * k
      ctx.save()
      ctx.globalAlpha = o.alpha
      ctx.translate(x0 + f / 2 + o.x * k * u, y0 + p / 2 + o.y * k * u)
      if (c !== 1) ctx.scale(c, c)
      if (o.shadowOpacity > 0) {
        tint(t, n, W, H, o.shadowColor)
        ctx.save()
        ctx.globalAlpha = o.shadowOpacity
        ctx.filter = o.shadowBlur > 0 ? `blur(${o.shadowBlur}px)` : 'none'
        ctx.translate(o.shadowX * u, o.shadowY * u)
        ctx.drawImage(work, y, b, f, p)
        ctx.restore()
      }
      const mask = Math.max(0, Math.min(1, o.mask))
      if (mask <= 0) {
        ctx.restore()
        continue
      }
      if (mask >= 1) ctx.drawImage(n, y, b, f, p)
      else {
        const a = Math.round(H * mask)
        const s = Math.min(Math.round(o.maskSoftness * this.k), a, 0.5 * H)
        const solid = Math.max(a - s, 0)
        t.clearRect(0, 0, W, H)
        t.drawImage(n, 0, 0)
        t.clearRect(0, a, W, H - a)
        if (s > 0) {
          const grad = t.createLinearGradient(0, 0, 0, a)
          grad.addColorStop(0, 'rgba(255,255,255,1)')
          grad.addColorStop(solid / a, 'rgba(255,255,255,1)')
          grad.addColorStop(1, 'rgba(255,255,255,0)')
          t.save()
          t.globalCompositeOperation = 'destination-in'
          t.fillStyle = grad
          t.fillRect(0, 0, W, a)
          t.restore()
        }
        ctx.drawImage(work, y, b, f, p)
      }
      if (o.reveal > 0) {
        tint(t, n, W, H, INK)
        ctx.save()
        ctx.globalAlpha = o.reveal
        ctx.drawImage(work, y, b, f, p)
        ctx.restore()
      }
      ctx.restore()
    }
  }
}

function tint(t, img, w, h, color) {
  t.clearRect(0, 0, w, h)
  t.drawImage(img, 0, 0)
  t.save()
  t.globalCompositeOperation = 'source-in'
  t.fillStyle = color
  t.fillRect(0, 0, w, h)
  t.restore()
}
