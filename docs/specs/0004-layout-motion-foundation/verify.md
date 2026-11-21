# Verify: layout and motion foundation · spec 0004 · updated 2026-11-21
_Steps derived from spec 0004 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones. Run them on the branch's Cloudflare Pages preview, on a laptop with a mouse, unless a step says otherwise._

## UI / manual
- [ ] Open `/` at 1440 wide → the `#work` container is 1312 wide with 64 gutters; shrink below 1024 → gutters become 16 → AC-1 (Container row)
- [ ] Open `/` and `/pt/` at 320 wide, then a 1280 window at 200% zoom → no horizontal scroll on either page → AC-1
- [ ] Scroll `/` → Hero, Selected work, Building now, Services, About, Highlights (no heading), Clients, then the footer, in that order; headings read from the content (Portfolio / Selected work, and so on), Portuguese on `/pt/` → AC-2 (Shell heading row, Section ids row)
- [ ] Look at the eyebrows → Selected work coral, Services and About violet; Building now and Clients show no eyebrow → AC-2 (Shell heading accent row)
- [ ] Measure the gap between two shells → 160 from 1024 wide, 96 below → AC-2 (Section rhythm row)
- [ ] Compare each empty shell's height with its Paper artboard (desktop and phone) → matches the shell height table → AC-2 (Shell min height row)
- [ ] Scroll with a mouse wheel and a trackpad → smooth, eased scroll; `html` carries `lenis` → AC-3 (Smoothing row)
- [ ] Scroll with arrows, Page Down, Space, Home, End, find in page (Cmd F) and Tab → all still move the page → AC-3
- [ ] On a phone (real touch) → scroll is native, no smoothing, no glow → AC-3, AC-5 (Glow allowed row)
- [ ] In the console run `document.body.insertAdjacentHTML("beforeend", '<a href="#services" style="position:fixed;bottom:8px;right:8px;z-index:50">go</a>')`, scroll a little, click it → page glides to Services, its top rests 88 below the window top (72 below 1024 wide), the URL ends `#services`, focus is on the Services heading; press Back → the page returns to where you were → AC-4 (Scroll padding row, Lenis anchor offset row)
- [ ] Repeat with a link to `#highlights` → the Highlights section itself gets focus → AC-4
- [ ] Move the mouse into the page → a soft violet glow (about 18%) appears right under the pointer, with no sweep from the corner, and trails it smoothly; leave the window or switch apps → it fades out → AC-5 (Glow colour, size, position, follow feel rows)
- [ ] Reload at the top, then scroll down slowly → each section heading fades in with a small rise when its top passes about 90% of the window height; the hero never animates → AC-6 (Reveal and Reveal trigger point rows)
- [ ] Reload with the page scrolled halfway down → headings already on screen are visible at once, never blink → AC-6
- [ ] Print preview → every heading is visible, no glow → AC-6
- [ ] Turn on Reduce motion in the OS → within a second, no `lenis` class, no `data-motion`, no glow, all headings visible; turn it off → motion returns, without a reload → AC-7 (Motion allowed row)
- [ ] Press Tab once on `/` → a violet "Skip to content" pill appears top left at the gutter; Enter → focus lands on `main`, URL ends `#main`, instantly; on `/pt/` it reads "Pular para o conteúdo" → AC-8 (Skip link label and look rows)
- [ ] Keep pressing Tab → every link shows the 2px outline with 2px offset; in Safari use Option+Tab → AC-8

## Commands
- [ ] `pnpm check:budget` → motion JavaScript at 40 KB gzipped or less (32.7 KB at build time) → AC-9
- [ ] `pnpm check:islands` → no page loads React → AC-9
- [ ] `pnpm test` → helpers (`anchorTarget`, `focusTarget`, `parsePixels`, `isAboveFold`) and `a11y.skipToContent` pass → AC-4, AC-6, AC-8
- [ ] `pnpm build && pnpm preview`, then `pnpm test:e2e` → `e2e/motion.spec.ts` passes on desktop and the WebKit keyboard project → AC-1 to AC-9
- [ ] Lighthouse or the Performance panel on the preview → CLS 0 while scrolling, above the fold content on first paint → AC-9

## Acceptance-criteria coverage
- AC-1: container and overflow steps · AC-2: shell order, accents, rhythm, heights · AC-3: wheel, keyboard, touch · AC-4: injected anchor links, Back · AC-5: glow and touch · AC-6: reveals, reload halfway, print · AC-7: Reduce motion toggle · AC-8: skip link, outlines · AC-9: budget, islands, CLS
