# 0002. Static Astro site with React islands on Cloudflare Pages

**Date**: 2026-11-20
**Status**: In Progress

## Summary

The new renon.dev is built with Astro, a framework that turns components into plain HTML files at build time, with React used only for the few parts that need to react to the visitor (islands). Styling is Tailwind with the Paper style board tokens, motion is GSAP plus Lenis (smooth scrolling), and the finished files are served for free from Cloudflare Pages. Every pull request gets its own preview address, and production only changes when you merge into `main`. This keeps the page fast enough for the Release 2 motion budget, while you keep writing the React and TypeScript you already know.

## Requirements

**User stories**:
- As Renon, I want a stack I can work in quickly with my React and TypeScript habits, so that building the page stays fun and fast.
- As a visitor, I want the page to load quickly on a phone in either language, so that I see the work before I lose interest.

**Acceptance criteria** (checked on the scaffold, feature 1):
- **AC-1**: `pnpm build` produces static files only in `dist/`: `dist/index.html` (English, `lang="en"`), `dist/pt/index.html` (Portuguese, `lang="pt-BR"`) and `dist/404.html`, the two language pages each with a canonical link and reciprocal `hreflang` alternates, and the 404 page with `noindex` and no canonical (a canonical on an error page sends search engines a mixed signal). Page copy is labelled placeholder text until feature 3.
- **AC-2**: `pnpm dev` runs the site locally, and `pnpm preview` (`astro preview`, no rebuild) serves the existing `dist/`, so you can check the exact files that Cloudflare Pages will receive.
- **AC-3**: A page with no React island makes no request for the React runtime. Proved with a test only page holding one hydrated island (React is fetched) next to the real pages (React is never fetched).
- **AC-4**: Every pull request, forks included, runs one GitHub Actions job named `site-check` with no secrets: frozen install, `biome ci`, `astro check`, `astro build`. A repository ruleset on `main` makes `site-check` required, so a failure blocks the merge.
- **AC-5**: The Cloudflare Pages project is connected to this GitHub repository (Git integration) and builds with `pnpm build` into `dist`. Every pushed branch gets a preview deployment, with its URL posted on the pull request by Cloudflare; only `main` publishes production, so your merge is the explicit OK. The ruleset keeps anything off `main` until `site-check` passes. No deploy credentials live in GitHub.
- **AC-6**: Fonts are served from the site itself (no request to a third party host), Latin subset WOFF2 only, `font-display: swap`, with the weights the Paper style board uses (Barlow Condensed 600 included), and the Portuguese accented glyphs render in the built page.

## Decision

**Chosen option**: Option 1: Astro with React islands, Tailwind, GSAP and Lenis, on Cloudflare Pages.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance` (`greensock/gsap-skills`, `.agents/skills/`) · `cloudflare`, `wrangler`, `web-perf` (`cloudflare/skills`, `.agents/skills/`)

The site is an Astro 7 static build in TypeScript, with React islands only where state is needed, styled with Tailwind 4 on the Paper tokens, animated with GSAP and Lenis, checked by GitHub Actions and deployed by Cloudflare Pages from Git (a preview per branch, production on merge).

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime and package manager | Node 24 LTS pinned exactly in `.node-version` (CI reads it), pnpm 12 pinned exactly in `packageManager`, committed `pnpm-lock.yaml` | The same tools run on your machine and in CI, and installs are reproducible. |
| Language | TypeScript 6, strict mode | `@astrojs/check` supports TypeScript 5 and 6 only, so 7 waits until it is supported. |
| Framework | Astro 7, `output: 'static'`, `build.format: 'directory'`, `trailingSlash: 'always'`, `site: 'https://renon.dev'` | Prerendered HTML per page with zero JavaScript by default and stable URLs. |
| UI islands | React 19 and `react-dom` via `@astrojs/react` | Only for a widget that truly holds state, with its hydration directive named in that feature's spec; everything else is `.astro`. |
| i18n routing | Astro i18n: `locales: ['en', 'pt']`, `defaultLocale: 'en'`, `routing.prefixDefaultLocale: false`; pages `src/pages/index.astro`, `src/pages/pt/index.astro`, `src/pages/404.astro`; one layout takes the locale and writes `lang`, canonical and `hreflang` | Routing comes from config and file placement; head tags come from one route map; where the copy lives is feature 3. |
| Styling | Tailwind 4 via `@tailwindcss/vite` and `@import "tailwindcss"`; tokens exported from the approved Paper file `renon-dev` (style board, approved again 2026-11-20, see feature 4) into `src/styles/theme.css` as a `@theme` block | The style board stays the single source, and the legacy Astro Tailwind integration is not used. |
| Motion | GSAP 3 (core, ScrollTrigger added with the first pinned scene) plus Lenis, from Astro client scripts. Lenis runs from the GSAP ticker (`autoRaf: false`) and calls `ScrollTrigger.update` on scroll; native scroll under `prefers-reduced-motion: reduce`; above the fold content visible on first paint; anchors and focus keep working through pinning | Pinning and scroll scrubbing for Release 2 without fighting the design's motion and accessibility baseline; no React needed. |
| Fonts | Fontsource, self hosted, explicit Latin WOFF2 imports: `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/barlow-condensed` (the weights the style board uses, 600 included) | No third party request; subset, weights and preload under your control. |
| Images | Astro assets (`astro:assets`, sharp at build time) | Responsive sizes and modern formats generated at build, no runtime service. |
| SEO plumbing | `@astrojs/sitemap` with `i18n` mapping `en` to `en` and `pt` to `pt-BR`, 404 excluded; non launch hosts (`*.pages.dev`) send `noindex` through a `_headers` rule | Sitemap and alternates from one config; titles, descriptions and OG images are feature 11. |
| Lint and format | Biome 2 with an explicit `files.includes` scope (`biome ci` in CI) | One fast tool for lint and format; `astro check` adds type checking of `.astro` templates, a complementary check. |
| CI | GitHub Actions job `site-check` on every pull request (forks included) and on `main`: frozen install, `biome ci`, `astro check`, `astro build`; required by a ruleset on `main`. Built in the scaffold; feature 2 adds tests and stricter rules | Every change is checked before merge, with no secrets in reach. |
| Hosting | Cloudflare Pages project with Git integration, production branch `main`, created by you in the Cloudflare dashboard; name `renon-dev` if free, and the real project name and hostname are recorded in this spec once created. Root `404.html` always shipped | Free static requests and preview URLs on the network your DNS already uses; without a root `404.html`, Pages would answer unknown paths with the home page. |
| Deploy | Cloudflare Pages Git integration, set up by you in the dashboard: production branch `main`, build command `pnpm build`, output directory `dist`, Node from `.node-version`. Each branch push builds a preview (`<branch>.<project>.pages.dev` alias plus a unique URL per deployment, posted on the pull request); a merge into `main` publishes production | Works like Vercel: no deploy workflow or secrets to maintain. Your merge is the explicit OK for production, and the required `site-check` keeps unchecked code off `main`. Production stays on the `*.pages.dev` address until launch (feature 12). |

Layers deliberately left out: database, auth, background jobs and server side code (the page has none), and analytics (deferred, feature 18).

## Consequences

**Positive**:
- Static sections cost no JavaScript, which leaves the Release 2 budget for motion and video.
- Hosting is free and close to your DNS; every pull request can be checked on a real Pages address, and production only moves when you merge.
- Language routes, sitemap and image sizes come from the framework instead of custom code.

**Negative / tradeoffs**:
- You learn `.astro` components and the islands model, and shared state between islands needs care.
- Biome lints `.astro` files only partly; `astro check` must stay in CI to cover the gap.
- TypeScript stays on 6 until `@astrojs/check` supports 7.
- Merging into `main` publishes production right away, so a merge must be treated as a release.
- Pages limits each file to 25 MiB, which caps any Release 2 video kept on Pages.
- Cloudflare puts new hosting features into Workers first, so a move to Workers static assets may be worth it later.

**Neutral**:
- Cloudflare builds the site on its own build image, so it must keep honoring `.node-version` and the pinned pnpm version; `site-check` stays the build of record.
- Moving renon.dev from WordPress to this Pages project is a custom domain and DNS change done at launch (feature 12), not now.

## Follow-up

- [ ] Feature 1 scaffold sub task: create the project from this stack with `/develop stack & architecture: scaffold`.
- [ ] Feature 2: capture conventions with `/audit` once the scaffold exists, and choose the test runners there (Vitest and Playwright are the likely fit). CI itself is built in the scaffold (AC-4); feature 2 extends it.
- [ ] Feature 14: define how the Release 2 gate is measured (a repeatable throttled phone run in both languages with scripted interactions; lab LCP and CLS, Event Timing as a stand in for field INP). Start with one compressed clip plus poster under the 25 MiB Pages limit; if that fails the gate, keep Release 1 motion rather than assume R2 or Stream stays free.
- [x] Before the first deploy: you connect the Pages project to GitHub (production branch `main`). Record its real name and hostname here once the first build lands.
- [ ] After the first pull request preview: check direct navigation to `/` and `/pt/`, `/pt` redirecting to `/pt/`, a missing path returning HTTP 404, and that production did not change.
- [ ] Record the installed Agent Skills (astro; gsap core, scrolltrigger, timeline, performance; cloudflare, wrangler, web perf) in `AGENTS.md` when `/audit` runs.

## Rationale

The context, the options weighed and the reasoning live in [rationale.md](rationale.md).

## Verify

Verify steps for the scaffold live in [verify.md](verify.md).
