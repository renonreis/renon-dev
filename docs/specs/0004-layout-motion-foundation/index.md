# 0004. Layout and motion foundation

**Date**: 2026-11-21
**Status**: Proposed

## Summary

This spec sets the shared ground every section of the page stands on: the page container and section rhythm, smooth wheel scrolling (Lenis, a small library that eases the scroll), a soft violet glow that follows the mouse, a one time fade in for content as it enters the screen, and the keyboard and reduced motion baseline. It is built on the real home page, with empty section shells (real headings, reserved height) that features 6 to 10 then fill in. Everything is progressive: with scripts off, on a phone, or with reduced motion turned on, the page is static, readable and fully usable. GSAP (the animation library chosen in spec 0002) loads now, so Release 2 only adds ScrollTrigger and never rewires the foundation.

## Requirements

**User stories**:
- As a recruiter or client on a laptop, I want the page to scroll smoothly and feel alive under my cursor, so that it reads as a crafted, memorable portfolio.
- As a visitor who prefers reduced motion, I want a static page with every word visible, so that browsing it never makes me unwell.
- As a keyboard or screen reader user, I want to skip straight to the content, always see where focus is, and land on the right heading from any link, so that I can use the page as fast as anyone else.
- As the engineer building features 6 to 10, I want one container, one section component and one reveal hook, so that each section only adds its own content.

**Acceptance criteria**:
- **AC-1**: Page container. Every page section's content sits in one container: max width 1312 (`--container-content`), side gutters 16 below 1024 wide and 64 from 1024 wide (`desktop` breakpoint). The home page in both languages has no horizontal scroll at 320 wide and at 200% zoom of a 1280 wide window.
- **AC-2**: Section shells. `/` and `/pt/` render, in Paper order inside `<main id="main">`: Hero (`#hero`, unchanged), Selected work (`#work`), Building now (`#now`), Services (`#services`), About (`#about`), Highlights (`#highlights`), Clients (`#clients`), then the footer (`#contact`) after `<main>`. Each shell with a title shows its eyebrow (where the content source has one) and an `h2` from `getContent(locale)`; Highlights and the footer have no section heading, so the Highlights `section` and the `footer` carry `tabindex="-1"` as their own anchor focus targets. Sections are 96 apart below 1024 wide and 160 from 1024 wide. Each shell reserves its temporary min height from the shell height table below. The page keeps exactly one `h1`.
- **AC-3**: Smooth scroll. When `prefers-reduced-motion` is `no-preference`, wheel and trackpad scrolling is smoothed by Lenis (`html` carries the `lenis` class, lerp 0.1); touch scrolling stays native (`syncTouch` off). Lenis is driven by the GSAP ticker (`autoRaf` off, one named callback `(time) => lenis.raf(time * 1000)` because the ticker gives seconds and Lenis wants milliseconds, `gsap.ticker.lagSmoothing(0)`). Keyboard scrolling (arrows, Page Down, Space, Home, End), find in page, Tab focus scrolling and browser Back and Forward between hash entries (native scroll restoration, no `popstate` handler) keep working.
- **AC-4**: In page links. Clicking or pressing Enter on any `a[href^="#"]` whose target exists on the page (except the skip link) scrolls to the target so its top rests at the scroll padding (within 2px), adds the hash to the URL with `history.pushState` (so the language switch from spec 0003 keeps the section), and then moves focus with `focus({ preventScroll: true })` to the target's heading (`[data-section-focus]`, or the target itself when it has none; every such target carries `tabindex="-1"`). The scroll strategy is chosen at click time: when Lenis is live, `lenis.scrollTo` and focus inside its `onComplete`; otherwise (reduced motion, or Lenis torn down) an instant `scrollIntoView` and focus right after. Both give the same focus and hash result. Links whose target does not exist do nothing special (browser default).
- **AC-5**: Cursor glow. When motion is allowed and the primary pointer is fine and can hover (`(hover: hover) and (pointer: fine)`), one decorative glow follows the pointer: violet at 18% (`--color-violet`, `--opacity-glow`), a 320 circle with blur 120 (the Paper `cursor-glow` recipe), centred on the pointer (`xPercent` and `yPercent` −50), placed on the pointer with `gsap.set` at the first move before it fades in (no sweep from the corner), eased toward it after that, painted behind page content and above the page background. It is `aria-hidden`, ignores pointer events, stays invisible until the first pointer move, fades out when the pointer leaves the window or the window loses focus, and animates only `transform` and `opacity`. It does not exist visually on touch or coarse pointers or under reduced motion.
- **AC-6**: Reveal on entry. An element marked `data-reveal` that is below the viewport when the motion script starts fades in with an 8px rise over 200 ms, once, when it enters the viewport. Elements already in or above the viewport at start never animate and never disappear. Content is never hidden for more than 200 ms after it enters the viewport. With JavaScript off, or if the motion script fails to load or throws, every element is visible. Focus moving into a hidden element reveals it at once, with no transition (`data-revealed="instant"` sets `transition: none`). Printing shows every element.
- **AC-7**: Reduced motion. Under `prefers-reduced-motion: reduce` there is no Lenis (native scroll, no `lenis` class), no glow, and no hidden reveal state; everything is static and visible. Switching the setting while the page is open applies within one second without a reload, in both directions; the teardown removes the ticker callback (`gsap.ticker.remove`) before `lenis.destroy()`, so no callback ever reaches a destroyed instance and no error reaches the console.
- **AC-8**: Keyboard baseline. On every page that uses `BaseLayout`, the first Tab stop is a "Skip to content" link (`getContent(locale).a11y.skipToContent`, in English and Portuguese) that is visually hidden until focused, then shown as the primary pill. Activating it jumps instantly (no smooth scroll, no script: the native fragment jump) to `<main id="main" tabindex="-1">` and moves focus there, in Chromium and WebKit. Every interactive element shows the 2px focus outline with 2px offset when focused by keyboard. `html` sets `scroll-padding-top` to the fixed bar height plus 16 (56 + 16 below 1024 wide, 72 + 16 from 1024 wide), so any element scrolled into view by focus or an anchor clears the bar feature 6 adds.
- **AC-9**: Budget and baseline. The home page still loads no React (`pnpm check:islands` passes). The motion JavaScript (GSAP core, Lenis and the project's motion modules) ships as deferred module scripts totalling 40 KB gzipped or less, enforced by `scripts/check-motion-budget.mjs` (gzips every module script `dist/index.html` references and fails above 40 KB) run as `pnpm check:budget` in `site-check` after the build. Motion adds no layout shift (reveals and the glow use only `transform` and `opacity`). Above the fold content is visible on first paint.

## Decision

**Chosen option**: Option 2, one progressive motion module: GSAP core plus Lenis for scroll and glow, IntersectionObserver plus CSS for reveals, a container utility and a `Section` component for layout.

Every page gets one deferred motion module, loaded from `BaseLayout`, that turns on smooth scroll, the glow and reveals only inside a `gsap.matchMedia` condition, so the static page is always the baseline and Release 2 adds ScrollTrigger to the same ticker.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `gsap-core` (`greensock/gsap-skills`, `.agents/skills/gsap-core/`) · `gsap-performance` (`greensock/gsap-skills`, `.agents/skills/gsap-performance/`) · `web-perf` (`cloudflare/skills`, `.agents/skills/web-perf/`)

## Feature design

**Data model sketch**: no persisted data. The only new data is one content key and a set of constants:

| Item | Shape | Where |
|---|---|---|
| `Content.a11y.skipToContent` | `string`, required in every locale | `src/i18n/content/types.ts`, `en.ts` ("Skip to content"), `pt.ts` ("Pular para o conteúdo") |
| Motion constants | `readonly` object: `lerp: 0.1`, `revealRootMargin: "0px 0px -10% 0px"`, glow follow duration `0.6` s with `power3.out`, glow fade `0.3` s, media query strings | `src/scripts/motion/config.ts` |
| Shell min heights | `readonly` map of section to `{ phone, desktop }` pixels (table below), temporary | `src/components/sections/shell-heights.ts` |

**Shell height table** (temporary, from the Paper desktop and phone artboard heights; each of features 7 to 10 deletes its row when it lands real content):

| Shell | Phone min height | Desktop min height |
|---|---|---|
| `#work` | 2182 | 2477 |
| `#now` | 1050 | 880 |
| `#services` | 1026 | 868 |
| `#about` | 736 | 970 |
| `#highlights` | 1130 | 960 |
| `#clients` | 508 | 426 |
| footer `#contact` | 504 | 640 |

**State transitions** (motion state, per page view):
- `static` (no JavaScript, script failed, or reduced motion): no `data-motion` on `html`, no Lenis, glow hidden, every reveal visible.
- Module start, any state: wire anchors once (`wireAnchors` reads the live Lenis, if any, on each click).
- `static → motion`: motion is allowed. In order: mark every `[data-reveal]` whose top is above the viewport bottom as `data-revealed`, then set `html[data-motion]`, start Lenis on the GSAP ticker, observe the remaining reveals.
- `motion → static`: reduced motion turns on. The `matchMedia` cleanup removes the ticker callback, destroys Lenis, disconnects the observer, removes `data-motion` (so every reveal is visible) and hides the glow.
- `static → motion` again when reduced motion turns off: the same start, where everything already revealed stays revealed.
- Glow, inside `motion` and only with a fine hover pointer: `hidden → shown` on the first `pointermove`, `shown → hidden` on pointer leaving the window or `blur`, `hidden → shown` on the next move.
- Reveal element: `pending → revealed`, one way, triggered by the observer, by `focusin`, or by the start rule above.

**API surface** (module interfaces; no network endpoints):

| Interface | Kind | Key inputs | Key outputs | Notes |
|---|---|---|---|---|
| `Section.astro` | Astro component | `id: string`, `headingId?: string`, `minHeight?: { phone: number; desktop: number }`, `class?: string`, default slot | `<section id aria-labelledby>` with section rhythm; the slot sits in an inner `div.container-page` so later sections can bleed backgrounds full width | Renders `aria-labelledby` only when `headingId` is given; without `headingId` the `section` itself gets `tabindex="-1"` (anchor focus target). `minHeight` becomes inline `--shell-min-phone` and `--shell-min-desktop`, and a `.shell-min` rule in `global.css` uses the phone value below 1024 and the desktop value from 1024 |
| `SectionHeading.astro` | Astro component | `id: string`, `title: string`, `eyebrow?: string`, `accent?: "coral" \| "blue" \| "violet" \| "green"` | eyebrow `p` (coloured `text-<accent>`, only rendered when `eyebrow` is given) plus `h2 tabindex="-1" data-section-focus data-reveal` | The anchor focus target; type roles from Paper (section title). `now` and `clients` have no eyebrow, so no accent shows there |
| `SkipLink.astro` | Astro component | `locale: Locale` | `a href="#main" data-skip-link` | First child of `body` in `BaseLayout` |
| `CursorGlow.astro` | Astro component | none | `div aria-hidden="true" data-cursor-glow` | Rendered in `BaseLayout`, hidden by default CSS |
| `Motion.astro` | Astro component | none | one processed `<script>` that imports `src/scripts/motion/index.ts` | Astro bundles it as a deferred module; no `is:inline` |
| `container-page` | Tailwind `@utility` | none | `mx-auto w-full max-w-content px-2 desktop:px-8` | In `global.css` |
| `startMotion(doc, win): () => void` | function, side effects | `Document`, `Window` | cleanup function | Entry; owns `gsap.matchMedia` |
| `revealOnEntry(root, observerInit): () => void` | function, side effects | root element, observer options | cleanup | IntersectionObserver plus `focusin` |
| `followPointer(el): () => void` | function, side effects | glow element | cleanup | `gsap.quickTo` on `x` and `y` |
| `wireAnchors(doc, getLenis): () => void` | function, side effects | `Document`, `getLenis: () => Lenis \| undefined` | cleanup | Click delegation on `a[href^="#"]:not([data-skip-link])`; picks the Lenis or instant strategy on each click from `getLenis()`, so it is wired once and survives reduced motion switches |
| `anchorTarget(href, doc): Element \| undefined` | pure | link `href`, `Document` | target or `undefined` | `undefined` for `#`, unknown ids, other pages |
| `focusTarget(target): HTMLElement` | pure lookup | target element | `[data-section-focus]` inside it, else the target | |
| `parsePixels(value): number \| undefined` | pure | a computed CSS length like `"88px"` | number or `undefined` | Reads `scroll-padding-top` for the Lenis offset |
| `isAboveFold(rect, viewportHeight): boolean` | pure | `DOMRect`, number | `rect.top < viewportHeight` | Start rule for reveals |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Container | max width 1312, gutters 16 / 64, switch at 1024 | Tokens `--container-content`, `--spacing-2`, `--spacing-8`, `--breakpoint-desktop` (Paper, spec 0001 AC-10) |
| Section rhythm | 96 / 160 between sections | Tokens `--spacing-12`, `--spacing-20` (spec 0001 style board) |
| Shell heading | eyebrow and title text | `getContent(locale)`: `work.eyebrow/title`, `now.title`, `services.eyebrow/title`, `about.eyebrow/title`, `clients.title` (spec 0003) |
| Shell heading accent | eyebrow colour per section | Paper section map (spec 0001): work coral, services violet, about violet; `now` (blue) and `clients` (green) have no eyebrow, so their accent arrives with features 7 and 10 |
| Shell min height | pixels per shell | Shell height table above (Paper artboard heights) |
| Section ids | `work`, `now`, `services`, `about`, `highlights`, `clients`, `contact`, `hero` | Spec 0001 AC-5 for the four nav targets; `hero` kept from spec 0003 tests; the other three decided here |
| Skip link label | "Skip to content" / "Pular para o conteúdo" | New key `a11y.skipToContent` (spec 0003 model) |
| Skip link look | primary pill | Paper primary pill (violet, `text-button`, height 48, `--radius-pill`); position top left at the gutter |
| Scroll padding | 72 / 88 | `--spacing-nav-sm` or `--spacing-nav` plus `--spacing-2` |
| Lenis anchor offset | negative scroll padding | `parsePixels(getComputedStyle(html).scrollPaddingTop)`, one source with AC-8 |
| Smoothing | lerp 0.1, touch native | Engineer's choice in this conversation; `config.ts` |
| Glow colour and opacity | violet at 18% | `--color-violet`, `--opacity-glow` (Paper `cursor-glow` recipe) |
| Glow size and blur | 320, 120 | Paper `cursor-glow` recipe, stored once as `--glow-size` and `--glow-blur` in `global.css` |
| Glow position | pointer `clientX`, `clientY` | `pointermove` event |
| Glow follow feel | 0.6 s, `power3.out`; fade 0.3 s | Decided here (`config.ts`), tunable on the preview |
| Reveal | opacity 0 to 1, `translateY(8px)` to 0, 200 ms | Spec 0001 motion map; easing `cubic-bezier(0.2, 0, 0, 1)` decided here |
| Reveal trigger point | element top passes 90% of the viewport height | `revealRootMargin` in `config.ts` |
| Motion allowed | boolean | `(prefers-reduced-motion: no-preference)` |
| Glow allowed | boolean | motion allowed and `(hover: hover) and (pointer: fine)` |

**Key invariants**:
- The HTML without scripts is the complete page. Hidden states exist only under `html[data-motion]`, which only the motion module sets, and only inside `@media (prefers-reduced-motion: no-preference)` CSS.
- DOM order is reading order and tab order; no motion code reorders, clones or traps content (spec 0001 constraint for feature 5).
- One Lenis instance, one ticker (GSAP), one glow element, one IntersectionObserver per page view; each start returns a cleanup that removes all of them.
- Motion code changes only `transform` and `opacity`, plus attributes; never layout properties.
- Module level values are constants; state lives in closures returned by the start functions (AGENTS.md functional rules).
- No React for any of this; Astro components and one bundled client script.

**Security model**: public static page, no user data, no storage, no network calls from motion code. No new third party origin (GSAP and Lenis are bundled from npm). No `is:inline` scripts, so a future strict Content Security Policy needs no new hash for this feature.

**Configuration required**: none. New exact pinned dependencies: `gsap` (latest 3.x) and `lenis` (latest 1.x), both pinned to an exact version in `package.json` as the project already does.

**Critical test scenarios**:
- Happy path (Playwright, desktop, motion allowed, fine pointer): `html` has `lenis` and `data-motion`; a wheel scroll moves the page; the glow becomes visible after a mouse move and has `aria-hidden`; a `data-reveal` heading in `#clients` is hidden at load and visible within 300 ms of scrolling it into view; verifies **AC-3**, **AC-5**, **AC-6**.
- Anchor: clicking a link to `#services` lands the section heading top at the scroll padding (within 2px), the URL ends with `#services`, and the focused element is the `#services` heading; the same with `reducedMotion: "reduce"`, and the same after switching reduced motion on with the page open; a link to `#highlights` focuses the section itself; then `page.goBack()` returns to the previous scroll position (within 2px); verifies **AC-3**, **AC-4**, **AC-7**.
- Reduced motion (Playwright `reducedMotion: "reduce"`): no `lenis` class, no `data-motion`, every `[data-reveal]` has computed opacity 1, glow hidden; then emulate `no-preference` on the open page and expect `data-motion` within one second, and back; verifies **AC-7**.
- No JavaScript (`javaScriptEnabled: false`): every `[data-reveal]` has opacity 1 and all shell headings are visible; verifies **AC-6**.
- Coarse pointer (Playwright `hasTouch`, `isMobile`): no `lenis` smoothing on touch input and glow hidden; verifies **AC-3**, **AC-5**.
- Keyboard (Chromium and WebKit projects): the first Tab focuses the skip link, which is visible; Enter moves focus to `main#main` and the URL hash is `#main`; Tab through the page shows an outline on every focused control; verifies **AC-8**. If WebKit fails the focus move, add a click handler on the skip link that calls `main.focus()`, and record that in this spec.
- Teardown: with the console listened to, toggle reduced motion on and off three times and scroll; expect no console errors; verifies **AC-7**.
- Focus into a hidden reveal: Tab to a link inside a not yet revealed element and expect it visible at once; verifies **AC-6**.
- Layout: at 320 wide and at 200% zoom `document.documentElement.scrollWidth <= clientWidth`; container width 1312 at 1440; gutters 16 and 64; section order and ids match AC-2 in both languages; verifies **AC-1**, **AC-2**.
- Budget: `pnpm check:islands` and `pnpm check:budget` pass; CLS from a scripted scroll is 0; verifies **AC-9**.
- Vitest: `anchorTarget`, `focusTarget`, `parsePixels`, `isAboveFold` and the `a11y.skipToContent` key in both locales; verifies **AC-4**, **AC-6**, **AC-8**.

## Build plan

Skateboard: the first task already gives a whole, static, accessible page; each later task adds one layer of motion on top of it, and the page works at every step.

1. Layout primitives: add the `container-page` utility, section rhythm and `scroll-padding-top` to `global.css`; add `Section.astro`, `SectionHeading.astro` and `shell-heights.ts`; add the shells (`Work`, `Now`, `Services`, `About`, `Highlights`, `Clients`, `Footer` in `src/components/sections/`) to `HomePage.astro` in Paper order; move the header and hero onto the container; give every page's `<main>` `id="main"` and `tabindex="-1"`; satisfies **AC-1**, **AC-2**, **AC-8** (scroll padding).
2. Keyboard baseline: add `a11y.skipToContent` to the content types and both locales; add `SkipLink.astro` as the first element in `BaseLayout`; style it from the Paper primary pill; suppress the outline only on `tabindex="-1"` targets (`main`, section headings), which are not controls; satisfies **AC-8**.
3. Motion module skeleton: install `gsap` and `lenis` at exact versions; add `config.ts`, the pure helpers and `index.ts` with `gsap.matchMedia` (conditions: motion allowed; glow allowed); add `Motion.astro` to `BaseLayout`; import `lenis/dist/lenis.css`; Lenis on the GSAP ticker through one named callback (`time * 1000`) with `lagSmoothing(0)`, and a cleanup that calls `gsap.ticker.remove` with that callback before `lenis.destroy()`; add `scripts/check-motion-budget.mjs` as `pnpm check:budget` and run it in `site-check` after the build; satisfies **AC-3**, **AC-7**, **AC-9**.
4. Anchors: `wireAnchors` wired once, choosing on each click between the Lenis strategy (offset from scroll padding, focus in `onComplete`) and the instant strategy (`scrollIntoView`, focus right after) from `getLenis()`, `pushState`, focus with `preventScroll`; skip link excluded; no `popstate` handler; satisfies **AC-3**, **AC-4**, **AC-7**.
5. Reveals: the reveal CSS (gated by `data-motion` and the motion media query, `data-revealed="instant"` with no transition, plus a print rule), `revealOnEntry` with the start rule, the observer and `focusin`; mark each `SectionHeading` with `data-reveal`; satisfies **AC-6**, **AC-7**.
6. Cursor glow: `CursorGlow.astro`, the `--glow-size` and `--glow-blur` values, `followPointer` with `gsap.set` on the first move then `gsap.quickTo`, centring with `xPercent` and `yPercent`, show and hide rules, stacking (glow fixed under a `relative z-1` header, main and footer); satisfies **AC-5**, **AC-7**.
7. Tests: the Vitest unit tests and the Playwright scenarios above, in a new `e2e/motion.spec.ts`, with a WebKit project for the keyboard scenario; satisfies **AC-1** to **AC-9**.

## Consequences

**Positive**:
- Features 6 to 10 only fill a shell: container, rhythm, heading, focus target and reveal come for free.
- The page is correct before any motion runs, so a motion bug can never hide content or break navigation.
- Release 2 adds ScrollTrigger to the existing ticker and Lenis instance, no rewiring.

**Negative / tradeoffs**:
- About 33 KB gzipped of script on every page before any cinematic scene exists; the price of not rewiring later.
- The temporary shell min heights are magic numbers outside the token set; they must be deleted by features 7 to 10, or the page keeps empty space.
- Smooth wheel scrolling is a taste call some visitors dislike; there is no in page toggle, only the system reduced motion setting.
- A blurred 320 layer moving on every pointer frame costs some GPU on older laptops; it is composited (`transform` only) but still a layer the size of 560 with its blur.
- The skip link and its string are not in the approved Paper file yet; a small design and copy review is owed.

**Neutral**:
- `hero` stays as the hero id (tests and the language switch use it) while Paper labels it `#top`; Paper should be updated to `#hero`.
- Three new ids (`now`, `highlights`, `clients`) become part of the URL surface and must not be translated, like the four nav ids.
- The scroll padding anticipates the fixed bar from feature 6; until then it adds 72 or 88 of space above anchor targets.

## Follow-up

- [ ] Add the skip link (default and focus) to the Paper style board and the `a11y.skipToContent` strings to the copy sheet, then have the engineer approve them (spec 0001 AC-9 rule: later changes go back through review).
- [ ] Rename the hero anchor in Paper from `#top` to `#hero`, and add the `#now`, `#highlights` and `#clients` ids to the section notes.
- [ ] Features 7 to 10: delete the shell's row from `shell-heights.ts` when the section lands; delete the file when it is empty.
- [ ] Feature 6: make the bar fixed at 56 / 72 so the scroll padding matches it; the nav links reuse `wireAnchors` and the `data-section-focus` headings.
- [ ] Tune the scroll lerp, the glow follow feel and the reveal easing on the Pages preview with the engineer; change `config.ts` only.

## Rationale

See [rationale.md](rationale.md) for the context, the options weighed and why this one won.
