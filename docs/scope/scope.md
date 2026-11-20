# Scope: renon-dev

A cinematic, scroll driven one page portfolio for Renon Reis (Senior Software Engineer and Tech Lead), in English and Portuguese, for recruiters and clients. It replaces the WordPress site at renon.dev at launch; the WordPress repo ([renonreis/renon.dev](https://github.com/renonreis/renon.dev)) stays intact.

**Repository:** [renonreis/renon-dev](https://github.com/renonreis/renon-dev), public.
**Build approach:** Skateboard (ship the whole page with real content and simple motion first, then layer the cinematic motion section by section).
**Workflow:** Alpha (after `/develop`, `/check verify` on the real page). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· Beta`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## Decisions already made (2026-11-20)

- **Look and motion:** inspired by the structure and motion language of a cinematic game launch site (layered hero intro, pinned scenes, scroll scrubbed video, large alternating cards, cursor glow). Inspiration only: no pixel copy of that site, and no third party names, logos, art, fonts or footage. Own identity: renon.dev.
- **Reference material:** the engineer's screen recordings and reference prompt stay outside this public repo.
- **Design:** screens drawn in Paper from the references, without the Triquetra design system for now.
- **Art:** correctly sized placeholders first; real art is its own later feature.
- **Content:** real clients and metrics from the CV (Sicredi, Printi, Contabilizei) as text, no client logos without permission. Copy drafted from the CVs in first person, reviewed by the engineer before launch.
- **Languages:** English (default) and Portuguese.
- **Domain:** build on a preview address; take over renon.dev at launch.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | done |
| 3 | Content model & bilingual copy | Foundation | planned |
| 4 | Page design in Paper | Foundation | done |
| 5 | Layout & motion foundation | Foundation | planned |
| 6 | Hero, navbar & footer | Release 1 | planned |
| 7 | Selected work | Release 1 | planned |
| 8 | Services | Release 1 | planned |
| 9 | About & highlights | Release 1 | planned |
| 10 | Clients | Release 1 | planned |
| 11 | SEO & social metadata | Release 1 | planned |
| 12 | Launch on renon.dev | Release 1 | planned |
| 13 | Loader & layered hero intro | Release 2 | planned |
| 14 | Pinned scenes & scroll scrubbed backdrops | Release 2 | planned |
| 15 | Final artwork | Release 2 | planned |
| 16 | Blog / writing | Deferred | planned |
| 17 | Contact form | Deferred | planned |
| 18 | Analytics | Deferred | planned |
| 19 | Résumé download | Deferred | planned |

## Foundations

### 1. Stack & architecture · done · Beta
Choose the static site stack and hosting shape, then scaffold a runnable project. Inputs: the renon.dev audit recommended a static build (`renonreis/renon.dev` `docs/audit/2026-11-20-zero-dawn-audit.md`); the reference prompt used a React, Vite, Tailwind, GSAP, Lenis stack.
**Done when:** the stack and hosting approach are recorded in a spec, and the empty scaffold runs locally and builds to static files.
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture: scaffold` (AC-1 to AC-6)
- [x] Verify it: `/check verify stack & architecture`
- [x] Test it: `/test stack & architecture`
Spec [0002](../specs/0002-static-site-stack/index.md) · code in `src/`, `astro.config.mjs`, `scripts/`, `.github/workflows/`

### 2. Coding standards & tooling · done
Capture conventions from the scaffolded project, then install lint, format and CI.
**Done when:** root `AGENTS.md` (with its `## Git` block) reflects the real stack, and lint, format and build run clean in CI.
- [x] Capture conventions + tooling choices: `/audit` · root `AGENTS.md`, `src/AGENTS.md`
- [x] Install tooling: `/develop tooling` · Biome pre-commit hook (`.githooks/`), Vitest and Playwright in `site-check`

### 3. Content model & bilingual copy · needs a decision
One content source that every section reads, in English and Portuguese, with copy drafted from the CVs (first person, real clients and metrics).
**Done when:** every word on the page lives in the content source in both languages, the language can be switched and is reflected in the URL, and the engineer has reviewed the copy.
- [ ] Design it (spec): `/architect content model & bilingual copy`

### 4. Page design in Paper · done
Desktop and mobile screens for the whole page in Paper, from the references: section order, type scale, colours, spacing, art slots, and notes on the motion of each section.
**Done when:** every section in features 6 to 10 has a desktop and a mobile screen in Paper with placeholder art slots, and the engineer approved them.
- [x] Design it (spec): `/architect page design`
- [x] Build it: `/develop page design`
   - [x] Paper file and style artboard: palette, type, spacing, components, focus states (AC-2, AC-7)
   - [x] Every section at desktop width with real copy and labelled placeholders (AC-1, AC-3 to AC-6)
   - [x] Phone artboards, Portuguese length check, motion notes, contrast (AC-1, AC-4, AC-7, AC-8)
   - [x] Review with you until approved (AC-9) · approved 2026-11-20 by the engineer, Paper file `renon-dev` as it stood at commit 846be45; any later change goes back through review · re-approved 2026-11-20 after style board section 06 (component dimensions) and five fine step tokens were added for AC-2; motion notes kept on Notes artboards beside each pair, accepted by the engineer for AC-7
- [x] Verify it: `/check verify page design` · PASS 2026-11-20
Spec [0001](../specs/0001-page-design.md) · design in Paper: [renon-dev](https://app.paper.design/file/01M7X587C321BGJ0TWYAX5C9ED)

### 5. Layout & motion foundation · needs a decision
Shared pieces every section stands on: page grid, smooth scrolling, the cursor glow, section transitions, and the reduced motion and keyboard baseline.
**Done when:** an empty page scrolls smoothly with the cursor glow, `prefers-reduced-motion: reduce` gives a static readable page, and focus is always visible.
- [ ] Design it (spec): `/architect layout & motion foundation`

## Release 1: the whole page, simple motion

### 6. Hero, navbar & footer
The page shell: name and role, a "Hire me" call to action, tech tags, language switch, social and email links in the footer.
**Done when:** the hero, navbar (with the call to action appearing as the hero scrolls away) and footer render in both languages at phone and desktop widths, and every link works by keyboard.
- [ ] Build it: `/develop hero, navbar & footer`

### 7. Selected work
Featured project and project cards: Sicredi Internet Banking, the Sicredi design system, Printi e-commerce, and more from the CV.
**Done when:** each card shows title, role, stack and the outcome metric from the CV, in both languages, with placeholder art.
- [ ] Build it: `/develop selected work`

### 8. Services
What you can be hired for (for example tech leadership, design systems, frontend rescue, full product builds).
**Done when:** the service cards render with their call to action in both languages.
- [ ] Build it: `/develop services`

### 9. About & highlights
A short bio set in Curitiba, plus two wide alternating highlight cards (open to conversations, off the clock).
**Done when:** the bio and highlight cards render with text on the side the art leaves free, in both languages.
- [ ] Build it: `/develop about & highlights`

### 10. Clients
Companies you worked with and one testimonial or proof point, as text.
**Done when:** client names and the proof point render in both languages, with no third party logos.
- [ ] Build it: `/develop clients`

### 11. SEO & social metadata
Title, description, social cards, language alternates and a sitemap for both languages.
**Done when:** each language version has its own title, description and social card, alternates point at each other, and the sitemap lists both.
- [ ] Build it: `/develop seo & social metadata`

### 12. Launch on renon.dev · needs a decision
Move renon.dev from the WordPress site to the new site without losing it: the WordPress site stays reachable elsewhere or goes offline, by the engineer's choice. Any deploy needs the engineer's explicit OK.
**Done when:** renon.dev serves the new site over HTTPS, `www` redirects, the WordPress site is preserved, the published renon.dev contact address receives mail, and the page passes a Core Web Vitals check on mobile.
- [ ] Design it (spec): `/architect launch on renon.dev`

## Release 2: the cinematic layer

### 13. Loader & layered hero intro
A short loader and the layered hero intro that resolves into the hero.
**Done when:** the intro plays once, never blocks content for long, skips under reduced motion, and ends on the exact frame the hero starts from.
- [ ] Design it (spec): `/architect loader & layered hero intro`

### 14. Pinned scenes & scroll scrubbed backdrops
Pinned sections and video backdrops that play with the scroll, behind work, services and about.
**Done when:** scenes pin and hand off smoothly at phone and desktop widths, video stays smooth on a mid range phone, and reduced motion shows still frames.
- [ ] Design it (spec): `/architect pinned scenes & scroll scrubbed backdrops`

### 15. Final artwork · needs a decision
Replace placeholders with real art (your photos, footage of Curitiba, or illustrations), fitted to every slot.
**Done when:** no placeholder remains, every crop keeps its subject clear of the text at phone and desktop widths, and all art is yours or licensed.
- [ ] Design it (spec): `/architect final artwork`

## Deferred

### 16. Blog / writing · needs a decision
Posts in the repo with a list on the page and a post page.
- [ ] Design it (spec): `/architect blog`

### 17. Contact form · needs a decision
A form that emails you, instead of only email and social links.
- [ ] Design it (spec): `/architect contact form`

### 18. Analytics · needs a decision
Privacy friendly page view analytics to replace GA and GTM, ideally with no cookie banner. The engineer is comparing options.
- [ ] Design it (spec): `/architect analytics`

### 19. Résumé download
A PDF CV in English and Portuguese, linked from the page.
- [ ] Build it: `/develop résumé download`

## Legend

Status: `planned` · `in-progress` · `done` · `dropped`. Tags: `needs a decision` (run `/architect` first), a tier tag such as `· Beta` overrides the project default.
