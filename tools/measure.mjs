// Dump computed styles and bounding boxes for selectors on a page.
// Usage: node tools/measure.mjs <url> [--width 1440] [--height 900] [--scroll 0]
//          [--selectors "html,body,h1"] [--props "background-color,font-family"]
//          [--head] [--screenshot] [--wait 3000] [--out name]
// Writes JSON (and an optional screenshot) to .measure/.
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const url = args[0]
if (!url || url.startsWith('--')) {
  console.error('Usage: node tools/measure.mjs <url> [--width N] [--selectors a,b] [--props p,q] [--head] [--screenshot]')
  process.exit(1)
}
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const flag = (name) => args.includes(`--${name}`)

const width = Number(opt('width', 1440))
const height = Number(opt('height', 900))
const scroll = Number(opt('scroll', 0))
const wait = Number(opt('wait', 3000))
const selectors = opt('selectors', 'html,body').split(',').map((s) => s.trim()).filter(Boolean)
const props = opt('props', 'background-color,color,font-family,font-size,font-weight,line-height,letter-spacing')
  .split(',').map((s) => s.trim()).filter(Boolean)
const out = opt('out', `${new URL(url).hostname}-${width}-${scroll}`)

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const cache = join(homedir(), 'Library/Caches/ms-playwright')
  if (existsSync(cache)) {
    const dir = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop()
    if (dir) {
      const bin = join(cache, dir, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')
      if (existsSync(bin)) return bin
    }
  }
  return undefined
}

const browser = await chromium.launch({ executablePath: findChrome(), headless: true })
const page = await browser.newPage({
  viewport: { width, height },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
})
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
await page.waitForTimeout(wait)
if (scroll) {
  await page.evaluate((y) => window.scrollTo(0, y), scroll)
  await page.waitForTimeout(500)
}

const result = { url, width, height, scroll }
result.elements = await page.evaluate(
  ({ selectors, props }) => {
    const data = {}
    for (const sel of selectors) {
      data[sel] = [...document.querySelectorAll(sel)].slice(0, 20).map((el) => {
        const cs = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return {
          box: { x: r.x, y: r.y, width: r.width, height: r.height },
          styles: Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])),
        }
      })
    }
    return data
  },
  { selectors, props },
)

if (flag('head')) {
  result.head = await page.evaluate(() => ({
    title: document.title,
    links: [...document.querySelectorAll('link[rel*="icon"], link[rel="manifest"], meta[name="theme-color"]')].map(
      (el) => el.outerHTML,
    ),
    fonts: [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.style} ${f.status}`),
  }))
}

mkdirSync('.measure', { recursive: true })
writeFileSync(join('.measure', `${out}.json`), JSON.stringify(result, null, 2))
if (flag('screenshot')) await page.screenshot({ path: join('.measure', `${out}.png`) })
console.log(JSON.stringify(result, null, 2))
await browser.close()
