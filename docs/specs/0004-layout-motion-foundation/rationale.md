# 0004. Layout and motion foundation: rationale

The decision record behind [index.md](index.md). `/develop` builds from the index; this file explains why.

## Context

The page (spec 0001) is a cinematic, scroll driven one pager, built Skateboard style: the whole page with real content and simple motion first (Release 1), the cinematic layer after (Release 2). Today the home page renders only a minimal hero and the language switch (spec 0003). Before features 6 to 10 build their sections, they need shared ground: one container and section rhythm, the motion every section uses (one reveal on entry), the smooth scroll and cursor glow that give the page its feel, and the accessibility baseline the approved design promised.

The forces. Spec 0002 fixed the tools (GSAP plus Lenis from Astro client scripts, Lenis on the GSAP ticker, native scroll under reduced motion, zero JavaScript by default, React only for real state). Spec 0001 fixed the values and the constraints handed to this feature: native scroll and DOM order kept, focus never hidden under the fixed bar, glow off for coarse pointers, all nonessential motion off under reduced motion, content fully visible without scripts. AGENTS.md asks for functional code with side effects at the edges and WCAG AA. Release 2 only ships if mobile LCP is 2.5 s or less, INP 200 ms or less and CLS 0.1 or less, so every kilobyte and every main thread task in this foundation is spent from that budget.

The real risks are not visual. Smooth scroll libraries are a known source of broken anchors, focus landing under fixed bars, find in page and keyboard scrolling regressions, and laggy touch scrolling on mid range phones. Reveal animations are a known source of content that never appears when a script fails, and of invisible but focusable elements. A foundation that gets these wrong breaks every section built on it.

Without a decision, each of features 6 to 10 would invent its own container, its own reveal wiring and its own anchor handling, and Release 2 would have to rewire whatever Release 1 improvised.

## Options considered

### Option 1: Lean Release 1, no GSAP yet

Lenis runs its own animation loop, the glow follows the pointer with a small hand written `requestAnimationFrame` lerp, reveals use IntersectionObserver plus CSS, and GSAP arrives with feature 13 or 14.

**Pros**:
- About 6 KB of motion script instead of about 33 KB in Release 1.
- Fewer moving parts until a real scene exists.

**Cons**:
- Contradicts spec 0002 (Lenis on the GSAP ticker) and forces Release 2 to rewire the loop, the glow and the reduced motion handling.
- Hand written reduced motion teardown, where `gsap.matchMedia` gives it for free.

### Option 2: One progressive motion module, GSAP core now, IntersectionObserver reveals (chosen)

GSAP core drives the Lenis loop and the glow and owns the reduced motion and pointer conditions through `gsap.matchMedia`; reveals are a one shot IntersectionObserver plus a CSS transition; layout is a container utility and a `Section` component.

**Pros**:
- Matches spec 0002 exactly; Release 2 only adds ScrollTrigger.
- The cheapest reveal mechanism (no per frame work), independent of Lenis.
- Live reduced motion changes come from one `matchMedia` cleanup.

**Cons**:
- About 27 KB gzipped of GSAP core ships before any timeline needs it.
- Two reveal mechanisms in the long run (IntersectionObserver for simple reveals, ScrollTrigger for Release 2 scenes).

### Option 3: Everything on ScrollTrigger now

GSAP core plus ScrollTrigger from day one; reveals use `ScrollTrigger.batch` with `gsap.from`.

**Pros**:
- One scroll engine for Release 1 and Release 2.
- Batching and refresh handling are battle tested.

**Cons**:
- Adds ScrollTrigger (about 18 KB gzipped) to Release 1 for a one shot fade.
- `gsap.from` leaves content hidden if the script errors after setting the start state, unless guarded the same way as Option 2.

### Option 4: CSS scroll driven reveals, no JavaScript for reveals

Reveals use `animation-timeline: view()`; only Lenis and the glow need script.

**Pros**:
- Zero JavaScript for reveals, runs on the compositor.

**Cons**:
- Scroll linked, so it scrubs and reverses with the scroll instead of the one shot 200 ms fade the design specifies.
- Partial browser support at the time of writing (Firefox), so a fallback path is needed anyway.

## Rationale

Option 2 is the only one that honours both earlier specs at once. Spec 0002 already chose GSAP to drive Lenis, so loading GSAP core now is not speculative: it is the loop the scroll runs on, and `gsap.matchMedia` gives the live reduced motion teardown the engineer asked for without hand written bookkeeping. Option 1 saves about 27 KB today but rebuilds the same wiring in Release 2, which is exactly the rework the Skateboard approach is meant to avoid at foundation level.

For reveals, the design asks for a one shot 200 ms fade, not a scroll linked effect. IntersectionObserver plus a CSS transition is the boring, cheapest tool for that: no per frame work, no ScrollTrigger until a pinned scene needs it (spec 0002 already deferred ScrollTrigger to that point), and it behaves the same with Lenis on or off. CSS scroll driven animation (Option 4) produces a different effect and lacks support. ScrollTrigger (Option 3) is the right tool for Release 2 scenes, not for this.

The failure modes drove the shape more than the tools. Hidden states live only under an attribute the module sets after it marks what is already on screen, so a failed script, no JavaScript, reduced motion and printing all show the full page. Anchors go through one handler that reads its offset from the same `scroll-padding-top` that native focus scrolling uses, so smooth links, instant links and Tab all land clear of the bar. Touch scrolling stays native, so mid range phones keep their own momentum and the INP budget stays untouched. The container and `Section` component follow from the design never needing more than 2:1 and 1:1 splits: a 12 column system would be ceremony, and utilities alone would repeat the id, heading and reveal wiring seven times.

A cross check by another model (Gemini 3.8 Flash, 2026-11-21) found eleven gaps the engineer chose to close: ticker time units and ticker cleanup, anchor strategy chosen per click, focus timing in `onComplete`, focus targets for sections without a heading, an inner container wrapper, responsive shell heights through CSS variables, the accent prop, the glow's first move, an instant reveal on focus, and an enforced script budget. Two suggestions were declined in favour of tests: a `popstate` handler (browsers already restore scroll between same document hash entries, and a handler would fight that) and a script fallback for the skip link in WebKit (current WebKit focuses a `tabindex="-1"` fragment target; the WebKit test adds the fallback only if it fails).

Small calls made here, each tunable later: glow follow 0.6 s with `power3.out` (runner up 0.4 s, which felt twitchy in common practice); reveal easing `cubic-bezier(0.2, 0, 0, 1)` (a standard decelerate curve; runner up `ease-out`); reveal trigger at 90% of the viewport (runner up the viewport edge, which fires before the visitor sees it); the glow drawn with `filter: blur` to match the Paper recipe exactly (runner up a radial gradient without a filter, cheaper to paint, if the preview shows jank on older laptops); the outline suppressed only on `tabindex="-1"` focus targets, which are not controls, so focus visibility on every control stays intact.
