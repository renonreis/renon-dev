# 0002. Static Astro site with React islands on Cloudflare Pages

**Date**: 2026-11-20
**Status**: Proposed

## Summary

The new renon.dev is built with Astro, a framework that turns components into plain HTML files at build time, with React used only for the few parts that need to react to the visitor (islands). Styling is Tailwind with the Paper style board tokens, motion is GSAP plus Lenis (smooth scrolling), and the finished files are served for free from Cloudflare Pages. Nothing deploys unless you start it by hand. This keeps the page fast enough for the Release 2 motion budget, while you keep writing the React and TypeScript you already know.

## Context

The page is a single public portfolio in English and Portuguese, with the language in the URL, and it must be found by search engines and shared with clean previews (feature 11). Spec 0001 fixed the design and deliberately left the framework open. Release 1 ships simple motion; Release 2 adds a layered intro, pinned scenes and scroll scrubbed video, and only ships if mobile LCP stays at 2.5 s or less, INP at 200 ms or less and CLS at 0.1 or less (spec 0001, Consequences). Every kilobyte of JavaScript the page ships works against that budget.

There is no server side logic: no accounts, no database, no form (the contact form is deferred, feature 17), and every call to action is an email link. The audit of the current WordPress site already recommended a static build (`renonreis/renon.dev`, `docs/audit/2026-11-20-zero-dawn-audit.md`).

You are the only engineer. You write TypeScript, React and Next.js daily, the Triquetra design system you maintain is React, and the domain's DNS already lives on Cloudflare. Hostinger is ruled out, and no deploy may happen without your explicit OK. Cost should stay at zero for a personal site.

Without this decision no code can start: features 3 and 5 to 12 all build on whatever stack is chosen here.

## Requirements

**User stories**:
- As Renon, I want a stack I can work in quickly with my React and TypeScript habits, so that building the page stays fun and fast.
- As a visitor, I want the page to load quickly on a phone in either language, so that I see the work before I lose interest.

**Acceptance criteria** (checked on the scaffold, feature 1):
- **AC-1**: `pnpm build` produces static files only in `dist/`: `dist/index.html` (English, `lang="en"`), `dist/pt/index.html` (Portuguese, `lang="pt-BR"`) and `dist/404.html`, each with a canonical link and reciprocal `hreflang` alternates. Page copy is labelled placeholder text until feature 3.
- **AC-2**: `pnpm dev` runs the site locally, and `pnpm preview` (`astro preview`, no rebuild) serves the existing `dist/`, so you can check the exact files that Cloudflare Pages will receive.
- **AC-3**: A page with no React island makes no request for the React runtime. Proved with a test only page holding one hydrated island (React is fetched) next to the real pages (React is never fetched).
- **AC-4**: Every pull request, forks included, runs one GitHub Actions job named `site-check` with no secrets: frozen install, `biome ci`, `astro check`, `astro build`. A repository ruleset on `main` makes `site-check` required, so a failure blocks the merge.
- **AC-5**: No workflow deploys on push or merge, and the Cloudflare Pages project has no Git integration (Direct Upload). Deploys run only from a `workflow_dispatch` you start (that dispatch is your explicit OK), with input `target` = `preview` or `production`. Production only runs from `main`, at a commit whose `site-check` passed. Deploy credentials exist only in the deploy job, runs are serialized (one at a time), and the job summary records the commit, the target and the deployment URL that Wrangler returned.
- **AC-6**: Fonts are served from the site itself (no request to a third party host), Latin subset WOFF2 only, `font-display: swap`, with the weights the Paper style board uses (Barlow Condensed 600 included), and the Portuguese accented glyphs render in the built page.

## Options considered

### Option 1: Astro with React islands, Tailwind, GSAP and Lenis, on Cloudflare Pages

Astro renders every page to HTML at build time and has i18n routing built in. React is added as an integration and used only for a widget that truly holds state; menus and switches are plain HTML with a small script. Styling is Tailwind 4 with the Paper tokens; motion is GSAP with ScrollTrigger plus Lenis, loaded as plain client scripts.

**Pros**:
- Ships zero JavaScript by default; each island is opt in, which protects LCP and INP.
- Static per language routes with `/` and `/pt/` come from configuration, not custom code.
- React components, including future Triquetra pieces, still work where they are needed.

**Cons**:
- A second component format (`.astro`) to learn next to React.
- Sharing state between islands is awkward (it needs small stores or custom events).
- Biome's support for `.astro` files is partial, so some template mistakes only surface in `astro check`.

### Option 2: Vite and React with build time prerendering

A plain React app built by Vite, with a prerender step (for example React Router's prerender mode) writing one HTML file per language.

**Pros**:
- One component model end to end, exactly your daily React.
- Very fast dev server and full control over the bundle.

**Cons**:
- The whole page hydrates as React, so the React runtime ships even for static sections.
- i18n routing, head tags, sitemap and image handling are assembled by hand.

### Option 3: Next.js 16 with static export

Next.js App Router with `output: 'export'`, producing static files.

**Pros**:
- The framework you use most, with a mature ecosystem.
- Server Components keep much of the page free of client code.

**Cons**:
- Static export disables middleware, so language detection and some i18n patterns need workarounds.
- The baseline client runtime is the heaviest of the three, which eats into the Release 2 budget.
- `next/image` optimisation does not work in a static export without a custom loader.

## Decision

**Chosen option**: Option 1: Astro with React islands, Tailwind, GSAP and Lenis, on Cloudflare Pages.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance` (`greensock/gsap-skills`, `.agents/skills/`) · `cloudflare`, `wrangler`, `web-perf` (`cloudflare/skills`, `.agents/skills/`)

The site is an Astro 7 static build in TypeScript, with React islands only where state is needed, styled with Tailwind 4 on the Paper tokens, animated with GSAP and Lenis, checked by GitHub Actions and deployed by hand to Cloudflare Pages.

## Rationale

The force that decides it is the Release 2 performance gate. A one page site with heavy scroll motion spends its INP and LCP budget on JavaScript, and Astro is the only option here where static sections cost no JavaScript at all (basis: the islands architecture). The motion itself does not need React: GSAP and Lenis drive the DOM directly from a client script, and the language switch and phone menu are plain links and a native disclosure with a few lines of script, so React is reserved for a widget that truly needs state. You still write React where it matters, and Triquetra components remain usable. Astro lowers the JavaScript the page ships; it does not by itself guarantee the Core Web Vitals, which feature 14 still measures.

Bilingual static routing is the second force. Astro's i18n routing plus file placement gives `/` and `/pt/` and helpers for localized URLs (basis: Astro i18n routing docs); the document `lang`, canonical and `hreflang` tags are written by one shared layout from one route map, where Option 2 needs hand built routing and Option 3 loses middleware in a static export. Hosting is Cloudflare Pages, your choice: free static requests, preview URLs per deploy, and the same network as your DNS. Cloudflare now steers new projects toward Workers static assets (basis: Cloudflare's Pages to Workers migration guide), but Pages still fully serves a static site, and moving later is a small, reversible step since the build output is the same `dist/`. The Pages project uses Direct Upload instead of Git integration, because Git integration deploys on every push, which would break your rule that nothing ships without your explicit OK.

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
| Hosting | Cloudflare Pages, Direct Upload project (no Git integration), production branch `main`, created by you in the Cloudflare dashboard before the first deploy; name `renon-dev` if free, and the real project name and hostname are recorded in this spec once created. Root `404.html` always shipped | Free static requests and preview URLs on the network your DNS already uses; without a root `404.html`, Pages would answer unknown paths with the home page. |
| Deploy | Manual workflow `deploy.yml` (`workflow_dispatch`, input `target`), `concurrency` group so runs never overlap: checks out the exact commit, runs the same checks, then `wrangler pages deploy dist --project-name <project> --branch preview` (target `preview`) or `--branch main` (target `production`, refused unless the ref is `main`); writes commit, target and the deployment URL that Wrangler returns to the job summary | Your dispatch is the explicit OK; `--branch` is only a label that Pages compares to the production branch, so the returned URL is the one that identifies the upload. Production stays on the `*.pages.dev` address until launch (feature 12). |

Layers deliberately left out: database, auth, background jobs and server side code (the page has none), and analytics (deferred, feature 18).

## Consequences

**Positive**:
- Static sections cost no JavaScript, which leaves the Release 2 budget for motion and video.
- Hosting is free, close to your DNS, and every deploy is a deliberate act.
- Language routes, sitemap and image sizes come from the framework instead of custom code.

**Negative / tradeoffs**:
- You learn `.astro` components and the islands model, and shared state between islands needs care.
- Biome lints `.astro` files only partly; `astro check` must stay in CI to cover the gap.
- TypeScript stays on 6 until `@astrojs/check` supports 7.
- Without Git integration there is no automatic preview per branch; previews come from the manual workflow instead.
- Pages limits each file to 25 MiB, which caps any Release 2 video kept on Pages.
- Cloudflare puts new hosting features into Workers first, so a move to Workers static assets may be worth it later.

**Neutral**:
- The deploy workflow needs two repository secrets: `CLOUDFLARE_API_TOKEN` (scoped to Cloudflare Pages edit on one account) and `CLOUDFLARE_ACCOUNT_ID`.
- Moving renon.dev from WordPress to this Pages project is a custom domain and DNS change done at launch (feature 12), not now.

## Follow-up

- [ ] Feature 1 scaffold sub task: create the project from this stack with `/develop stack & architecture: scaffold`.
- [ ] Feature 2: capture conventions with `/audit` once the scaffold exists, and choose the test runners there (Vitest and Playwright are the likely fit). CI itself is built in the scaffold (AC-4); feature 2 extends it.
- [ ] Feature 14: define how the Release 2 gate is measured (a repeatable throttled phone run in both languages with scripted interactions; lab LCP and CLS, Event Timing as a stand in for field INP). Start with one compressed clip plus poster under the 25 MiB Pages limit; if that fails the gate, keep Release 1 motion rather than assume R2 or Stream stays free.
- [ ] Before the first deploy: you create the Direct Upload Pages project (production branch `main`), record its real name and hostname here, and add the two Cloudflare secrets to a GitHub environment used only by the deploy job.
- [ ] After the first approved preview deploy: check direct navigation to `/` and `/pt/`, `/pt` redirecting to `/pt/`, a missing path returning HTTP 404, and that production did not change.
- [ ] Record the installed Agent Skills (astro; gsap core, scrolltrigger, timeline, performance; cloudflare, wrangler, web perf) in `AGENTS.md` when `/audit` runs.

## References

**Project sources**:
- Spec 0001, Consequences (the Release 2 performance gate) and Context (no stack chosen yet).
- `docs/scope/scope.md`, feature 1 inputs and the deferred features 17 and 18.
- `renonreis/renon.dev`, `docs/audit/2026-11-20-zero-dawn-audit.md` (static build recommendation).

**Practices & standards**:
- Islands architecture (ship HTML by default, hydrate only interactive parts).
- Core Web Vitals thresholds (LCP, INP, CLS).
- Least privilege API tokens for CI deploys.

**Links**:
- Astro, Internationalization (i18n) Routing: https://docs.astro.build/en/guides/internationalization/
- Cloudflare, Migrate from Pages to Workers: https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
