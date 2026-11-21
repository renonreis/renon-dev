import media from '../assets/hosted-media.json'
import cityPortraitPoster from '../assets/site/city/poster-portrait.avif'

// Cloudinary renditions for the scroll-scrubbed clips (AGENTS.md › Scroll-scrubbed videos): every
// frame kept, a keyframe every 0.08s, no audio, H.264. The services clip has ~16px dark bars at
// both sides, so the landscape crop trims them. Crops use explicit pixel boxes: Cloudinary rounds
// centred and auto crops differently for video and stills, and the poster must be frame 0 of the
// exact same crop. The city portrait crop uses g_auto so it follows the rider; its still can't be
// reproduced by Cloudinary, so the poster is frame 0 cut locally (tools/video-poster.sh).
const VIDEO = 'ac_none,ki_0.08,q_auto:good,vc_h264'
const STILL = 'so_0,q_auto:good'

const CROPS = {
  services: {
    landscape: 'c_crop,w_1240,h_698,x_20,y_10',
    portrait: 'c_crop,w_404,h_720,x_478,y_0',
  },
  city: {
    landscape: null,
    portrait: 'c_fill,ar_9:16,h_720,g_auto',
    portraitPoster: cityPortraitPoster,
  },
}

const transform = (url, ...steps) =>
  url.replace('/upload/', `/upload/${steps.filter(Boolean).join('/')}/`)

export function scrubVideo(name) {
  const url = media[name].video
  const crop = CROPS[name]
  const still = url.replace(/\.mp4$/, '.jpg')
  const build = (c, poster) => ({
    video: transform(url, c, VIDEO),
    poster: poster || transform(still, c, STILL),
  })
  return { landscape: build(crop.landscape), portrait: build(crop.portrait, crop.portraitPoster) }
}

// Real length of the services rendition (checked with ffmpeg: 34 frames at 24fps, 1.42s).
export const SERVICES_FRAMES = 34
export const SERVICES_FPS = 24
// City renditions, landscape and portrait: 149 frames at 24fps, 6.2s.
export const CITY_FRAMES = 149
export const CITY_FPS = 24
