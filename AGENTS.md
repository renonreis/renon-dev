# Grand Theft Developer: a GTA VI-style developer portfolio

Version 2 of renon.dev: Renon Reis's developer portfolio built on the layout and motion of the GTA VI website (https://www.rockstargames.com/VI). Fan-made, not affiliated with Rockstar Games.

- **Layout and motion** match the live site exactly: layout, type scale, colours, timing and easing.
- **Content and artwork** are ours: the text in `CONTENT.md`, and the illustrations, logo and videos in `src/assets/`.

This replaces the "own identity" direction in `docs/specs/0001-page-design.md` and `docs/scope/scope.md` (v1 plan, kept for history); the CV facts and links recorded there still apply.

## Inputs

1. The user's prompts.
2. This file, and `CONTENT.md` for every word on the page.
3. `src/assets/` (artwork, logo, fonts, `hosted-media.json`) and the screen recordings in `src/references/` (git-ignored: local only, never committed).
4. The live site: the source for layout, sizes, timing and motion only.

There is no earlier code, notes or known values. Never assume a value from memory or from how similar sites usually work; find it on the live site.

## Stack

React + Vite, Tailwind CSS (v4, `@tailwindcss/vite`), GSAP (ScrollTrigger), Lenis for smooth scrolling. Plain JavaScript, no TypeScript. Lint: `npm run lint` (oxlint). Build: `npm run build`.

## Method: Record → Measure → Extract → Rebuild → Diff

1. **Record:** `src/references/` holds one screen recording per section of the live site. They are the reference for motion and never ship.
2. **Measure:** with playwright-core and headless Chrome, dump computed styles and bounding boxes from the live site, sampling every 50px of scroll at 375, 768, 1024, 1440, 1920 and 2560px wide, plus phone landscape.
3. **Extract:** read the live site's front-end code for exact triggers, durations, eases and values. Prefer these to values fitted from recordings.
4. **Rebuild:** build from the numbers.
5. **Diff:** run the same measurement on localhost and compare.

Rules:
- Measure before building. When something looks off, measure both sites; never adjust by eye.
- Before trusting live-site numbers, check that headless Chrome received the same page a real browser does (compare with the recordings).
- When a value breaks the pattern found so far, measure it at every width instead of forcing it into the pattern.

## Definition of done

A section is done only when:
- its diff is within 1px / 1% at every width above. Mobile is part of the section, never a follow-up;
- its motion matches its recording, checked frame by frame;
- its handoffs work: what happens to the previous section as it arrives, pins, navbar changes, and the cursor glow (a soft light behind the page that follows the pointer: match its size, colour, blur, layering, and when it fades or returns);
- its text fits its artwork;
- `prefers-reduced-motion: reduce` gives a readable, static version, and everything clickable works by keyboard with a visible focus outline;
- nothing earlier broke: re-run earlier sections' checks after changing shared code.

Report what was checked and what still doesn't match.

## Tools

- Measuring and diff scripts live in `tools/` and stay reusable: they take a URL, a viewport width and selectors.
  - `tools/measure.mjs <url> --width N --selectors a,b --props p,q [--scroll Y] [--head] [--screenshot]`: computed styles + boxes to `.measure/<out>.json` (finds the Playwright Chromium in `~/Library/Caches/ms-playwright`, or `CHROME_PATH`).
  - `tools/contact-sheet.sh <out.jpg> <cols> <w> <h> <images…>`: tiles images into one sheet for a quick look (ffmpeg).
  - `tools/make-favicons.sh`: rebuilds `public/favicon.ico` (48×48), `favicon-32.png` and `apple-touch-icon.png` from `src/assets/brand/logo-poster.png` (needs ffmpeg).
- Measurement output and temporary files go in `.measure/`, which is git-ignored.

## Assets

```
src/assets/
  brand/              the logo poster (VI + wordmark) and the loader logo
  fonts/              Outfit and Barlow Condensed (free, Google Fonts)
  site/               every image the page loads, already cut to size
    hero/             collage pieces + logo layers, desktop + mobile
    meet-the-developer/  services/  highlights/  clients/  blog/  footer/
  source/             the original artwork, grouped by shape, and the hero piece outlines
  hosted-media.json   Cloudinary links to the two scroll-scrubbed videos
```

- Use `site/` as delivered and never edit it by hand. If a slot needs a different crop, re-cut it from `source/` with a script in `tools/`.
- On the first pass through the assets, record which file belongs to which section under Findings, and keep that map current.

## Artwork

Our own artwork only. Never download, hotlink or trace Rockstar's images, video, logos or fonts.

- Measure each artwork slot on the live site (box size, aspect ratio, crop, focal point) at every width and fit our art to it. Never upscale past the original size. When square art fills a wide or tall slot, place it whole and fill the rest with a blurred extension, so text baked into the art stays readable.
- Check every crop at desktop and phone widths: the subject stays in view and clear of the text over it. Put a card's text on the side where the art leaves room.
- **Hero:** match the live site's layer count, canvas size and positions so the intro lines up; measure them first. The poster shown after the intro must match the intro's last frame pixel for pixel, or the logo flickers at the swap. All logo layers come from the same source, so they stack exactly.
- If no asset fits a slot, use a plain placeholder of the right size and list it under Open differences.

## Scroll-scrubbed videos

- Import their links from `src/assets/hosted-media.json`; never copy URLs into components.
- Build renditions with Cloudinary URL transformations: keep every frame, add a keyframe every few frames, drop the audio, and give portrait phones a 9:16 crop that follows the subject. The poster is the first frame of the same crop, so nothing jumps when the video takes over.
- Check each video's real length and frame count before mapping it to scroll, and how many pixels of scroll each frame gets. If a short clip would step, play it over part of the scroll range and hold the first and last frames either side.

## Page map

| Live section | Our section |
|---|---|
| Loader | Loader, with our loader logo as the shape |
| Navbar | GTD monogram, menu icon, and a "Hire Me" pill that appears as the hero scrolls away |
| Hero (layered intro) | Our collage and logo, tagline, "Hire Me" button, tech tags, fan-made line |
| Launch Trailer | Meet the Developer: pinned scene, a wide featured card, and three project cards |
| Ultimate Edition | Services: scroll-scrubbed video backdrop and two service cards |
| Vice City, USA. | Curitiba, Brazil.: bio over the scroll-scrubbed city video |
| Feature cards | Four wide cards: Open to Work, After Hours, Case Study, Off the Clock |
| Shop | Clients: two cards |
| Featured News | Blog: three posts |
| Footer | Logo, "Build Your Own" pill, socials, links, disclaimer, "Rated D for Developer" badge |

Keep our own titles whatever the live site's headings say, and don't build promo strips or banners above the page (the live site's top "out now" strip is skipped). When the live page has something this page map doesn't, ask the user before building it.

## Content

Use the content from `CONTENT.md`, next to this file: it holds every word on the page, section by section. Put it in one content file, `src/content.js`, with one object per section, and have components read from it. `CONTENT.md` is the source of truth: when it changes, update `src/content.js` to match. Several images have titles painted into them; the copy in `CONTENT.md` matches them, so if you change one, change the other.

- **Voice:** first person ("I build…"). The developer's name appears only in the page title, the meta description, the bio and the footer ©.
- **Real vs sample:** this is Renon's real portfolio. Facts come from his CV (see `CONTENT.md`); never invent a number, client or claim. Cards whose painted art shows sample work (project cards, testimonial, blog, client logos on the key rack) stay labelled "Sample" until their art is replaced. Keep every link in one `LINKS` object in `src/content.js`; real links are filled in, pages that don't exist yet stay `#`.
- **Disclaimer:** "Fan-made GTA VI-style portfolio. Not affiliated with Rockstar Games." appears in the hero, the footer and the meta description. Never remove it.

## Project memory

This file is the only context that carries between prompts and sessions. Keep it current so a new session can pick up exactly where the last one stopped.

- **Progress:** update it at the end of every task, before replying: done, in progress, next, and open differences from the live site. Write it for someone with no other context.
- **Findings:** add facts as they're established (asset map, how sizes scale, breakpoints, colours, fonts, code layout, non-obvious problems) with where each was measured.
- Keep both short. Delete anything proven wrong, and collapse finished work into one line.

## Git

- Commits are authored by the user. **Never add an AI co-author or attribution line** to commits or PRs.
- Commit only when asked. Never force-push.
- Work for v2 lives on branch `feat/gtd-v2`.

## Progress

**Done:** step 1. Vite + React (JS) scaffold with Tailwind v4, GSAP and Lenis installed; starter code removed; empty page on the live site's background; favicons from our logo; Outfit + Barlow Condensed loaded; our logo poster centred on screen. `tools/measure.mjs` and `tools/make-favicons.sh` in place. `CONTENT.md` rewritten from Renon's CV, mirrored in `src/content.js`.

Step 2: every asset inspected and mapped to its section (Findings › Asset map).

**In progress:** none.

**Next:** measure the loader and hero intro on the live site (all widths, against `src/references/01-hero-intro.mp4`), then build Loader + Hero.

**Open differences:**
- Live fonts are proprietary (ArtDeco family); we use Outfit (for ArtDeco Regular/Medium/Bold) and Barlow Condensed 700/900 (for ArtDeco Condensed Bold/Heavy). Metrics will differ; size to measured boxes, not font-size.
- Live favicon is Rockstar's 48×48 `.ico`; ours is our logo at the same size.
- `site/hero/mobile/poster.avif` is 640×640 while the mobile layers are 1366×1366: the intro's last frame and the poster can't match pixel for pixel at the swap until the poster is re-cut at 1366² (check against the live mobile hero first).
- Sample, art-locked cards (projects, testimonial, blog) need new art before they can show Renon's real work (Sicredi Internet Banking, Sicredi design system, Printi). "Off the Clock" text is TBD from Renon.

## Findings

- **Background:** live `body` background `rgb(12, 13, 27)` = `#0c0d1b`, `html` transparent, text `#fff` (measured `tools/measure.mjs`, 1440×900, scroll 0, 2026-11-20). Headless got the real page (hero collage, "Buy Now" pill), so headless numbers are trustworthy.
- **Live head:** one `<link rel="icon" href="/favicon.ico" sizes="48x48">`, no `theme-color`, no manifest.
- **Live fonts:** ArtDecoRegular 400, ArtDecoMedium 500, ArtDecoBold 700, ArtDecoCondensedBold 700, ArtDecoCondensedHeavy 900 (loaded at first paint), plus Helvetica Now / Noto Sans CJK fallbacks for other locales.
- **Asset map** (checked file by file 2026-11-20 with ffmpeg + contact sheets from `tools/contact-sheet.sh`; "α" = has transparency):
  - `brand/logo-poster.png` 1448×1086 α, 1.2 MB: the full logo (gradient VI + white "grand theft developer"). Master for every logo cut and the favicons. Centred placeholder on the page today.
  - `brand/loader-logo.svg` (viewBox 184 27 1425 867): the wordmark letters as one flat path. Shape for the Loader.
  - `fonts/`: `outfit-variable.woff2` (100–900, body/UI), `barlow-condensed-700/900.woff2` (headlines). Latin subset, OFL.
  - `hosted-media.json`: `services` (neck-rotation clip, 1280×720 24fps, 1.42 s / 34 frames, behind Services cards) and `city` (sportbike pull-back to street, 1280×720 24fps, 6.2 s / 149 frames, behind "Curitiba, Brazil.").
  - `site/hero/desktop/` (2560×1440 canvases) and `site/hero/mobile/` (1366×1366 canvases): `shard-01…10` α, each a single collage piece already placed at its final spot on a transparent canvas (layers stack 1:1); `poster` opaque: the finished collage on a dark purple frame (all pieces, no logo), shown after the intro; `poster-logo` α: the full logo at its final hero spot; `logo-vi` α: the VI layer alone (wordmark area knocked out to dark); `logo-gta` α: the white wordmark alone.
    - Desktop pieces → source art: 01 off-the-clock (poster), 02 beachfront-classic-car, 03 code-master-supercar, 04 the-heist-case-study, 05 sunset-codeposter, 06 supercar-tech-stack, 07 performance-speedboat, 08 full-stack-developer, 09 achievements, 10 rooftop-full-stack (small, centre, behind the logo).
    - Mobile pieces → source art: 01 beachfront-classic-car, 02 code-master-supercar, 03 supercar-tech-stack, 04 off-the-clock, 05 the-heist-case-study, 06 rooftop-full-stack (small, centre), 07 sportbike-rider, 08 performance-speedboat, 09 supercar-projects-tower, 10 achievements.
  - `site/meet-the-developer/`: `scene` 1672×858 (projects-developer-supercar, pinned scene); `featured-desktop` 1672×669 (5:2) and `featured-mobile` 628×941 (2:3), sportbike-rider, "Ride Along"; `card-1…3` 1254×1858: AI Book Assistant, 3D Basketball Website, React Native "duolingo clone" (square art + blurred extension below; titles painted in).
  - `site/services/`: `card-tall-desktop` 1641×887 and `card-tall-mobile` 481×887 (site-glow-hotel-sign, "Your Site Glows / I Make It Glow" painted in; big card); `card-short` 1672×941 (rooftop-full-stack, "Full Stack Training School" tee; wide card).
  - `site/highlights/`: `open-to-work` 1983×793 (sunset-coast), `after-hours` 1024×410 (after-hours-nightclub; smallest, never upscale), `the-heist` 1983×793 (vault-heist), `off-the-clock` 1774×709 (alligator-float).
  - `site/clients/` 1254×1858: `clients` (key rack "25+ happy clients" with real company logos: label Sample), `testimonial` (Miami postcard with painted quote).
  - `site/blog/` ~1672×941: `post-1` ai-agents-escaped, `post-2` agentic-engineering-2026, `post-3` system-design-architecture (matching the CONTENT.md order; titles painted in).
  - `site/footer/logo.avif` 807×540 α: the footer logo, cut from `logo-poster.png`.
  - `source/`: originals (PNG, ~2 MB each), never loaded by the page: `posters/` 941×1672 (4), `squares/` ~1254² (5), `scenes/` ~16:9 (6), `banners/` ~5:2 (3), `projects/` 1254² (3), `clients/` 1254² (2), `blog/` 1672×941 (3). `hero-masks/desktop|mobile/shard-01…10.png`: greyscale white-on-black outlines of each hero piece (slightly skewed quads) at canvas size, for clipping/reveal in the intro.
  - Hero-only originals: everything in `posters/` and `squares/`, plus `scenes/code-master-supercar`. Every other original feeds exactly one section slot listed above (sportbike-rider and rooftop-full-stack also appear as hero pieces).
- **Code layout:** `src/main.jsx` → `src/App.jsx`; global CSS + `@font-face` + theme tokens in `src/index.css`; content in `src/content.js`.
