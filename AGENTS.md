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

**Done:** step 1 (scaffold, fonts, favicons, tools, `CONTENT.md` → `src/content.js`). Step 2: asset map (Findings). Step 3: navbar + hero layout; diff within 1px of the live site at 375×812, 768×1024, 1024×768, 1440×900, 1920×1080, 2560×1440, 844×390 (`.measure/diff.mjs`, live numbers in `.measure/hero-live.json`, git-ignored). Step 4: loader + hero intro (canvas fly-in ported from the live JS, outer timeline, cursor glow, intro overlay); after the intro the collage stays built from the ten shard `<img>`s stacked (no single poster image). Loader stays until fonts + the current hero set (12 layers, poster-logo) have decoded (15 s cap), then fades while the intro plays behind it; scroll locked until the intro ends. Checked: recordings at 375/1440 against `01-hero-intro.mp4`; canvas last frame vs the stacked shards at all 7 sizes (mean channel diff 0.8–7.6, 12.3 at 844×390: resampling only, geometry exact); final layout diff unchanged; reduced motion (static loader, no canvas, final layout); nothing focusable behind the loader (`inert`); lint + build.

Step 5: hero scroll-out (pinned hero, `pinSpacing:false`, 180-unit timeline, button pulse, fixed scroll cue, nav "Hire Me" pill reveal) matches the live samples at all 7 sizes (`.measure/hero-scroll-diff.mjs`). Step 6: Meet the Developer (pinned scene, Ride Along card, three project cards in a scroll-snap carousel with pagination) and Services (pinned backdrop with the scroll-scrubbed `services` video, two cards, theme colour tween). Static boxes match live within 1px at all 7 sizes once the cards' .985 scroll scale is removed (`.measure/loc/shots.mjs`); video seeks frame by frame between the fade-in end and the fade-out start (`.measure/loc/video.mjs`); reduced motion static; every card and the scene's Play reachable by Tab with a visible outline (`.measure/loc/kbd.mjs`); no horizontal overflow; hero re-checks unchanged; lint + build.

Step 7: Curitiba, Brazil. (pinned `city` video, bio, mask/fade hand-off, text gradient, theme back to base). Static boxes 0px from live at all 7 sizes, aligned on the section top (`.measure/r-vc/loc.mjs` vs `geo.json`); motion sampled every ¼ viewport on both sites at 1440 and 375 (pin, opacity, mask, scale, text gradient/filter, cursor glow, theme) matches within rounding (`.measure/r-vc/motion.mjs`); video scrubs frames 0→148 over 25–95% of the pin (`.measure/r-vc/video.mjs`); sequence matches `05-vice-city.mov` (contact sheets); reduced motion 0px from live lofi; no horizontal overflow; nothing focusable in the section. Services reduced motion fixed to keep live's grid rows (was 48u/36u too tall); Services video re-checked; lint + build.

Step 8: the rest of the page: Highlights (four wide cards), Clients (two stacked cards, carousel on portrait phones), Blog (three posts, carousel on portrait phones) and the footer. Card boxes, headers, Blog posts and footer logo match live to 0px at all 7 sizes, aligned on each section top (`.measure/rest/diff.mjs` vs `.measure/r-fs/geo.json` and `.measure/r-nf/geo-*.json`); remaining differences are copy length and item count (Open differences). Theme retint, card scale and picture parallax sampled every 100px against the live table at 1440 and 375 match within 1–2 colour units / 0.6px through the fourth card (`.measure/rest/motion.mjs`); Clients and Blog steps land on live's colours. Every new link reachable by Tab with a visible outline at 1440 and 375 (`.measure/rest/kbd.mjs`); reduced motion static; no horizontal overflow; MTD/Services boxes unchanged after moving the carousel to shared code; lint + build. Measuring scripts must wait for the scroll unlock (`html` overflow back to '') before reading trigger positions: App refreshes ScrollTrigger only then.

Step 9: sequence check against the recordings: 1 fps contact sheets of `03`–`06` vs our page swept at the recordings' viewports (1440×900, 1512×859, 1897×980; `.measure/nav/sweep.mjs`) show the same states in the same order (scene fade-in, featured card rise, card row; Services backdrop pin and hand-off to the city; four feature cards with retint; Clients, Blog, footer end state). Nav theme checked on live (`.measure/nav/live.mjs`, `els.mjs`, 1440 and 375): icons and pill never change colour, so there is nothing to port.

**In progress:** none.

**Next:** replace the sample art (projects, testimonial, blog) and the "Off the Clock" TBD copy when Renon supplies them; real links for Résumé, Privacy, Build Your Own, the case study and the posts.

**Open differences:**
- Live fonts are proprietary (ArtDeco family); we use Outfit (for ArtDeco Regular/Medium/Bold) and Barlow Condensed 700/900 (for ArtDeco Condensed Bold/Heavy). Metrics will differ; size to measured boxes, not font-size.
- Live favicon is Rockstar's 48×48 `.ico`; ours is our logo at the same size.
- Intro starts after the loader logo has faded (with the overlay fade), not with the logo fade as on live: on live the overlay hides most of the fly-in; Renon asked to see the pieces come together. Intro timing itself is unchanged.
- Loader logo box keeps the live 24u height but is wider (our wordmark's 1425:867 aspect; live is square).
- Our `logo-vi` layer shows as a dark blocky shape while the wordmark wipes in (the art knocks the wordmark area out to dark).
- At the swap the canvas and the stacked shards differ only by resampling (mean diff ≤7.6; 12.3 at 844×390 where the 2560→468 downscale filters differ).
- Live shows the finished collage as one poster image; ours stacks the ten shards (Renon's call), so the page's glow shows through the gaps between pieces.
- Navbar logo is a "GTD" text monogram (Barlow Condensed 900 SVG text), not a drawn logo like the live "VI".
- Hero "Hire Me" button is narrower than the live "Buy Now" (copy length); height/position match. The tagline wraps to 2 lines at 768–1023 and wide-phone landscape and overflows the info row (pinned to the button height so the frame still lines up).
- Hero tags are text in a row (live: stacked PS5/Xbox logos in a column).
- Portrait phones (frame 160/177) crop the sides of our square mobile poster; live serves a portrait crop. The ≥2.25:1 frame (64/27) cover-crops the 16:9 desktop poster.
- Disclaimer line sits inside the hero section (live has no such line). Our nav stays at top 0 (live's 60px offset is its banner); the hero diff's nav-pill flip at 1440/844 (500 vs live 550) and 844 `.hero-col` 30px offset are that banner, not ours.
- MTD project cards are ~35px taller than live (two-line titles plus "· Sample" in the eyebrow), so everything after MTD sits ~36px lower at 1440 (Services top 3926 vs 3890).
- "Full Product / Builds" body is cut by the live line clamp (3 lines ≥768, 4 on phones): the copy is longer than live's. Needs shorter copy in `CONTENT.md`.
- At 1440 the scene art's "PROJECTS" neon sign touches the "M" of the centred "Meet the Developer" title (art, not layout: needs a recut or art with the sign further left).
- Portrait phones: the MTD scene title "Meet the Developer" wraps to 2 lines and sits over the developer's head (art crop `80% 15%`; the scene is only 1.95:1).
- Carousel is native scroll-snap (live: Embla with drag); pagination dots are display-only as on live.
- Services video: 34 frames scrubbed over the clip span (live: 300 frames over the whole range); poster is Cloudinary `so_0` of the same crop.
- Services cards at portrait phones are 77px taller than live (the "Your Site Glows" title wraps to 2 lines, both bodies run 4 lines vs live 3), so City and everything after sit 77px lower at 375 and the cursor glow's fade back in after the Services cards starts 77px earlier relative to City. Copy-length only.
- Highlights has four cards, as in the recording `05`; today's live Feature cards has five (a fifth logo card added since), so everything after Highlights sits one card + gap higher (455px at 1440), and Clients' retint starts from Off the Clock's colours instead of live's fifth card.
- Highlights, Clients, Blog and footer text heights differ from live where our copy is longer or shorter (card titles/bodies, the Clients quote, Blog titles, the footer pill text). Footer has 2 socials and 3 legal links (live 7 and 6), so its nav row is narrower; our badge text and a disclaimer line under it make the footer 11–17px taller.
- Highlights art is 5:2 only; on portrait phones the picture fills just the 3:2 art area, cropped around each subject (`--focal`), where live serves a 2:3 crop under the whole card.
- Both Clients cards fade their art under the text; live fades only the first (our postcard art is busy where the title sits).
- Footer rating slot shows our own "D / DEVELOPER" badge (SVG) and isn't a link; live shows the ESRB image linking to esrb.org.
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
  - `site/hero/desktop/` (2560×1440 canvases) and `site/hero/mobile/` (1366×1366 canvases): `shard-01…10` α, each a single collage piece already placed at its final spot on a transparent canvas (layers stack 1:1); `poster` opaque: the delivered finished collage on a purple frame (not loaded: the page stacks the shards instead; mobile is 640²); `poster-logo` α: the full logo at its final hero spot; `logo-vi` α: the VI layer alone (wordmark area knocked out to dark); `logo-gta` α: the white wordmark alone.
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
- **Spacing scale** (live CSS, 2026-11-20): every size is a multiple of `u = min(1vw, 25.6px) / k`; k = 1 (<768), 3 (768–1023), 3.5 (1024–1439), 4 (≥1440), 4.5 (`min-aspect-ratio: 2.25/1`), 2 (<768 landscape). In code: `--u` in `src/index.css`. Live vars `--jhqn1x*` are u multiples (x3=1, x5=2, x7=3, x9=4, xb=5, xd=6, xh=8, xj=10, xl=12, xn=14, x1a=64).
- **Top banner offset:** the live "Out Now" strip (60px; 52px at 375, 32px at 667 landscape) pushes the nav down by its height and the centred hero by half. We skip it, so compare nav at live y − banner, hero at live y − banner/2, scroll cue (viewport bottom) unchanged.
- **Navbar:** fixed, padding 6u (10u ≥768, 7u at 768–1023); icon buttons 12u; logo 7u wide (9u ≥768); menu bars 5u/7u wide, height = gap = `round(1u|1.5u, .5px)`; hover `#fff9cb`, active `#ebe5b7`, focus outline white 1u. Small pill: min 24u×10u, padding 0 5u, font 3.5u, bg `#ffb2c6` / hover `#fc97b1` / pressed `#f77e9c`, text `#0c0d1b`, focus outline 4px offset 4px.
- **Hero:** 100svh grid, side padding 7.5vw (15vw <768 landscape, 10vw ≥1024, 13vw ≥1440, 64u ≥1920), max-width 2560. Column `min(100%,120svh)`; aspect 0.6–1 → `min(80%,60svh)`, frame 1/1; aspect ≤0.6 → frame 160/177; ≥2.25:1 or <768 & ≥2:1 → `min(100%,150svh)`, frame 64/27; <768 & ≤1:1 → `min(100%,40svh)`. Frame default 16/9. Stack gap 8u (6u <768, 5u wide). Info row: 3 columns, height = button, padding 0 2.5u. Title 6u (5.5u ≥768, 3.5u <768 landscape) weight 500 uppercase, glow `0 0 28px #fdfbff40`; subtitle 4u (3u) weight 700 `#ccc2f5`. Button: 24u×14u min, padding 0 7u, font 4.5u; portrait phone 12u high, padding 0 6u, font 4u; <768 landscape 10u, 0 5u, 3.5u. Hover text `#9c4958` on `#fdfbff`, pressed `#693c56` on `#fed6e3`. Portrait phones move the tagline above the frame and tags/button below it in a column. Button pulse (live JS): background `#ffb0c4` ↔ `#FED6E3`, also animating text colour and box-shadow. Scroll cue: bottom 0, height `max(5vw,10vh)×.45`, width ≤2.1rem, `#ffb2c6`, hidden <768 landscape.
- **Loader** (live `loader` JS/CSS): logo mask 24u tall, glow/fill/shine keyframes 2.15 s loop. Fadeout waits for an `animationiteration`, then logo opacity → 0 over 1000 ms `cubic-bezier(.2,0,.8,1)`, then the overlay → 0 over 1300 ms `cubic-bezier(.4,0,.8,1)`; live starts the intro with the logo fade.
- **Intro** (live `hero` JS; all values in `src/lib/hero-intro.js`): 12 canvas layers (shard0…9, logo_vi, logo_gta). The draw uses `images[layer.zIndex]`, and zIndex = the entry's position in the breakpoint's config list, so list position picks both the image and its start z (the config's `layer` field only picks the Layer object). Breakpoints, first match wins: fobSquare `(min-aspect-ratio: .6) and (max-aspect-ratio: 1)`, fobPortrait `(max-aspect-ratio: .6)`, fobUltrawide `(min-aspect-ratio: 2.25), (max-width: 767.98px) and (min-aspect-ratio: 2)`, else default. Canvas 100vw × 150svh centred on the frame; layers rasterised at 85vw (ultrawide ≤2560) with a camera onto the frame, perspective projection on z. Outer timeline: stack scale 1.4286 → 1 over 190/140 × 2.6 s power2.inOut and autoAlpha over 1.3 s power1.in; button at 2.6 s (42/140 × 2.6 s power1.in); tagline, tags, nav and glow (0 → .5) at 2.6 s (81/140 × 2.6 s power1.inOut); intro overlay `#0C0D1B` → transparent from .5571 s over 2.0429 s; then poster, logo and cue fade in over .5 s sine.inOut and the canvas is removed.
- **Swap alignment:** for the last frame to equal the stacked shard `<img>`s, the canvas must sit at whole device pixels with no CSS transform (Chrome snaps the layer origin and then applies the fractional `translate(-50%)`, blurring it), the images must land on the frame's pixel-snapped box, and the bitmaps are cut with `imageSmoothingQuality: 'low'` (Chrome's `<img>` downscale; 'high' is softer). Shards must be preloaded before the swap. Measured with `.measure/swap.mjs` (git-ignored).
- **Navbar theme** (live `bg` JS, `.measure/nav/`, 2026-11-21): the theme timeline also tweens `navText`/`navDivider` on the navbar, but they only colour a text label with a divider that the VI page doesn't render; the logo, menu bars and pill stay `#fff` / `#ffb2c6` at every scroll at 1440 and 375.
- **Cursor glow** (live `bg` JS): fixed layer behind the page, follows the pointer with `quickTo` .4 s ease none; rest opacity .5, 1 over links/buttons (.5 s sine.inOut); hidden on `(pointer: coarse)`. Layers: base z −4, glow z −3, intro overlay z −2.
- **Section grid** (live `_1uw8doi*`): `--side` 7.5vw / 10vw ≥1024 / 13vw ≥1440 / 64u ≥1920; `--gap` 12/16/18/22.5/25/27.5px at <768/768/1024/1440/1920/2560; `--block` 20u (<768) / 32u; row gap 8u; max-width 2560. `html, body { overflow-x: clip }` as on live.
- **Cards** (live `s7pzuf*`, `src/styles/cards.css`): padding 13u, radius 7u (3u <768); short 5:2 (7:3 <768 landscape), tall 37:20; portrait phones become a column with a 1:1 (tall) / 3:2 (short) art spacer. Title size from length (`getHeadlineSize`: >40→5, >30→4, >23→3, >13→2, else 1) → u: short 15/14/13/12, tall 18/17/16/14, portrait phone short 10/9/8, tall 12/11/10, <768 landscape 7/6/5; MTD half cards ≥1280: 13/12/11/10/8. Scroll: scale .985 → 1 over the first half of the pass, picture parallax (speed .97). Wide cards' mask follows the pointer (x −15…5 %, y 133…147 %). Themes per card (bg/glow/eyebrow/outline/pill) are inline CSS vars in the components.
- **Meet the Developer** (live Launch Trailer `_6sjiom*`): featured 135lvh, margin-top −65lvh, pinned from `top top` to the cards' `top top` (pin 315 → 2745 at 1440); picture 1.2 → 1, content 1.05 → .9; scene fades in over the first 100% (alpha power3.in, brightness .2 → 1 power1.in 61, text at 30, Play at 70), out as the cards rise. Cursor glow off during the scene, back as the cards arrive, off again at cards `bottom center-=40%`.
- **Services** (live Ultimate Edition `gihvh7*`): grid rows `100lvh−48u | 48u | min-content` (one row <768); backdrop 135lvh, margin-top −65lvh, pinned to the cards' top, media scale 1 → 1.1; fade-in from wrap `top top+=25%` over 100%; fade-out from cards `top bottom-=20%` (`-=40%` <768). Theme tween as Services scrolls in: `--page-bg` rgb(12,13,27) → rgb(24,24,45), `--spot` (glow colour) rgb(31,31,56) → rgb(47,46,82). At 1440: cards top 5832, big card 1065.6×576, wide 426.3 tall.
- **Curitiba, Brazil.** (live Vice City `n5j5p6*`, `src/styles/city.css`): margin-top −150lvh; rows `100lvh − (title·1.1 + 6u) | title·1.1 + 6u | min-content`; title 18u (10u <768) line-height 1.1, body 10u (5u), gap body/1.5, text block margin-top 250lvh, padding-bottom 16u (0 <768). Wrap pinned from `top top` to the text's `top top`; media scale 1 → 1.1; wrap autoAlpha power3.in over 150% (100% <768) from the section top; from the text's `top-=90% bottom` (`-=150%` <768) to `top top` a radial mask shrinks upwards (power1.out) and the wrap fades out over the second half; text gradient tween over its pass with brightness .8 → 1; cursor glow 0 → 1 from the text's `top bottom` over 30%; theme back to base (rgb(12,13,27) / rgb(31,31,56)) as the section arrives. Clip 149 frames over 25–95% of the pin. Reduced motion = live lofi: no pin, 100vh poster masked at the bottom, text in its grid row. Measured `.measure/r-vc/` (2026-11-20).
- **Highlights** (live Feature cards `_15id12y*`): `.grid-section` with padding-top 16u (10u <768), bottom --block; short 5:2 cards alternating text left/right (`card-end` on even), pointer-follow mask; card themes from the live cards' variables. Theme retint per card (`src/lib/theme.js`): page colour / glow colour move linearly from the previous block's to the card's own from its `top bottom` to `bottom bottom` (fitted: Open to Work #0f0c1a/#2d1f36, After Hours #0d0c1a/#132242, Case Study #071012/#142e25, Off the Clock #0d0c1a/#16203f, Clients #1d1627/#31223e, Blog back to base). Measured `.measure/r-fs/` (2026-11-20).
- **Clients / Blog** (live Shop `_82fiuk*`, Featured News `_10vlklc*`): padding 16u both (10u <768); header row title 8u (6u <768, line-height 1.3) weight 500, link 4.5u with a 6u arrow, icon-only on portrait phones (Clients: 8u round #4b2f54 button, 3.5u arrow). Clients cards span 6 (stacked: 3:2 art spacer, text below, art 50% 0%), title #ffd4a8, link #fee8ea. Blog posts span 4: radius 3.5u (3u <768), 16:9 cover on #070810 at .8 opacity, body padding 8u gap 4.5u (6u / 3.5u <768), title 4.5u/1.3 clamp 3 #e5ddff (3.5u/1.5 clamp 4 <768), date 4u/1.4 #ccc2f5; gradient #38365d→#1f1f38, hover gradient #433f6a→#252644. Carousels (shared `.carousel` in cards.css, `useCarousel` in hooks.js, `Pager.jsx`) show one card per page on portrait phones only. Measured `.measure/r-nf/` (2026-11-20).
- **Footer** (live outro `jjnta2*`): column, gap 8u, padding 16u (10u <768) / --block; logo, pill, pill font and icon use px tokens × --f (1 <1024, 1.125 to 1919, 1.25 to 2559, 1.375 ≥2560): logo 144px·f, pill title 16px·f bold uppercase, text 14px·f max 400px·f, padding 6u 12u, gap 10u, 1px rgba(255,255,255,.2) border (phones: radius 16px, padding 6u 8u, centred, wraps). Socials 12u round, 5u icon, #ccc2f5; legal 3u/1.5 #ccc2f5, gap 2u 4u (5u ≥768); rating row 88u wide (56u portrait phones), 48×72 mark, text 3u/1.5, 1px #1f1f38 rule. Measured `.measure/r-nf/colors.json` (2026-11-20).
- **Scrubbed video** (`src/lib/hosted-media.js`): Cloudinary `ac_none,ki_0.08,q_auto:good,vc_h264` (34 frames kept); explicit crops (landscape `c_crop,w_1240,h_698,x_20,y_10` drops the source's ~16px dark side bars; portrait 9:16 `w_404,h_720,x_478`) because `g_auto` picks different crops for video and jpg; poster `so_0` of the same crop (PSNR ≥33 dB vs frame 0). Clip fetched whole into a blob URL after load; `currentTime = (frame + .5)/24`, seek only on frame change.
- **Code layout:** `src/main.jsx` → `src/App.jsx` (phase machine loading → intro → done; locks scroll; page `inert` until the loader is removed); global CSS + `@font-face` + theme tokens + `--u` scale in `src/index.css`; `src/components/{Navbar,Hero,Loader,Backdrop,Card,Pager,SectionHeader,MeetTheDeveloper,Services,City,Highlights,Clients,Blog,Footer}.jsx` with styles in `src/styles/{navbar,hero,loader,backdrop,cards,meet-the-developer,services,city,highlights,rows,footer}.css` (imported into `layer(components)`); intro engine `src/lib/hero-intro.js`; hero asset sets + preload `src/lib/hero-media.js`; Lenis + ScrollTrigger in `src/lib/scroll.js`; shared card motion `src/lib/cards.js`; video URLs `src/lib/hosted-media.js` (city portrait poster cut locally by `tools/video-poster.sh`); `useMedia`, `useScrubClip`, `useCarousel` in `src/lib/hooks.js`; theme retint in `src/lib/theme.js`; dev builds expose `window.__ST` (ScrollTrigger) for the measuring scripts; content in `src/content.js`. Scroll glow fades target `.cursor-glow-fade` (opacity 1 = live .5).
