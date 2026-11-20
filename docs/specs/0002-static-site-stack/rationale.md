# 0002. Static Astro site with React islands on Cloudflare Pages: rationale

The decision record for [spec 0002](index.md). The build spec is in `index.md`.

## Context

The page is a single public portfolio in English and Portuguese, with the language in the URL, and it must be found by search engines and shared with clean previews (feature 11). Spec 0001 fixed the design and deliberately left the framework open. Release 1 ships simple motion; Release 2 adds a layered intro, pinned scenes and scroll scrubbed video, and only ships if mobile LCP stays at 2.5 s or less, INP at 200 ms or less and CLS at 0.1 or less (spec 0001, Consequences). Every kilobyte of JavaScript the page ships works against that budget.

There is no server side logic: no accounts, no database, no form (the contact form is deferred, feature 17), and every call to action is an email link. The audit of the current WordPress site already recommended a static build (`renonreis/renon.dev`, `docs/audit/2026-11-20-zero-dawn-audit.md`).

You are the only engineer. You write TypeScript, React and Next.js daily, the Triquetra design system you maintain is React, and the domain's DNS already lives on Cloudflare. Hostinger is ruled out, and no deploy may happen without your explicit OK. Cost should stay at zero for a personal site.

Without this decision no code can start: features 3 and 5 to 12 all build on whatever stack is chosen here.

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

## Rationale

The force that decides it is the Release 2 performance gate. A one page site with heavy scroll motion spends its INP and LCP budget on JavaScript, and Astro is the only option here where static sections cost no JavaScript at all (basis: the islands architecture). The motion itself does not need React: GSAP and Lenis drive the DOM directly from a client script, and the language switch and phone menu are plain links and a native disclosure with a few lines of script, so React is reserved for a widget that truly needs state. You still write React where it matters, and Triquetra components remain usable. Astro lowers the JavaScript the page ships; it does not by itself guarantee the Core Web Vitals, which feature 14 still measures.

Bilingual static routing is the second force. Astro's i18n routing plus file placement gives `/` and `/pt/` and helpers for localized URLs (basis: Astro i18n routing docs); the document `lang`, canonical and `hreflang` tags are written by one shared layout from one route map, where Option 2 needs hand built routing and Option 3 loses middleware in a static export. Hosting is Cloudflare Pages, your choice: free static requests, preview URLs per deploy, and the same network as your DNS. Cloudflare now steers new projects toward Workers static assets (basis: Cloudflare's Pages to Workers migration guide), but Pages still fully serves a static site, and moving later is a small, reversible step since the build output is the same `dist/`. The Pages project uses Direct Upload instead of Git integration, because Git integration deploys on every push, which would break your rule that nothing ships without your explicit OK.

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
