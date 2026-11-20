# Verify: stack & architecture · spec 0002 · updated 2026-11-20
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Open `pnpm preview` at `/` and `/pt/` in a browser → headings render in Barlow Condensed 600, body in Geist, eyebrow in Geist Mono; Portuguese accents (ação, coração, você) render in the brand fonts → AC-6
- [ ] With the network panel open on `/` and `/pt/` → every font request goes to the site itself (`/_astro/*.woff2`), none to a third party host, no `.woff` files → AC-6
- [ ] With the network panel open on `/` and `/pt/` → no JavaScript request at all (no React runtime) → AC-3

## Commands
- [ ] `pnpm install --frozen-lockfile` → succeeds with the committed lockfile → AC-4
- [ ] `pnpm build` → `dist/` holds `index.html` (`lang="en"`), `pt/index.html` (`lang="pt-BR"`) and `404.html` → AC-1
- [ ] `grep` the canonical and alternate links in `dist/index.html` and `dist/pt/index.html` → each has its own canonical plus `hreflang` `en`, `pt-BR` and `x-default` pointing to `https://renon.dev/` and `https://renon.dev/pt/` → AC-1
- [ ] `grep` `dist/404.html` → `<meta name="robots" content="noindex">` and no canonical → AC-1
- [ ] `dist/sitemap-0.xml` → lists `/` and `/pt/` with `en` and `pt-BR` alternates, no 404 → AC-1
- [ ] `pnpm dev` → `/` and `/pt/` answer 200 → AC-2
- [ ] `pnpm preview` (after a build, no rebuild) → `/` and `/pt/` answer 200, a missing path answers 404 → AC-2
- [ ] `pnpm check:islands` → ends with `AC-3 holds` (the test island page loads React, the real pages load none) → AC-3
- [ ] `dist/_astro/*.css` → only three `url()` font sources, all Latin WOFF2, each `@font-face` with `font-display: swap` → AC-6
- [ ] `gh pr checks <pr>` on a pull request → a job named `site-check` ran `biome ci`, `astro check`, `astro build` with no secrets → AC-4
- [ ] `gh api repos/renonreis/renon-dev/rulesets` → an active ruleset on the default branch requires `site-check` → AC-4
- [ ] Read `.github/workflows/*.yml` → no workflow deploys on `push` or `pull_request`; `deploy.yml` runs only on `workflow_dispatch` with `target` = `preview` or `production`, has a `concurrency` group, refuses production off `main`, requires a passing `site-check` for production, holds Cloudflare secrets only in the `cloudflare-pages` environment and writes commit, target and URL to the job summary → AC-5

## After the first approved preview deploy (needs the Pages project and secrets)
- [ ] Dispatch `deploy` with `target=preview` → the job summary shows the commit, `preview` and a `*.pages.dev` URL → AC-5
- [ ] On that URL → `/` and `/pt/` load directly, `/pt` redirects to `/pt/`, a missing path returns HTTP 404 with the 404 page, responses carry `X-Robots-Tag: noindex`, and production did not change → AC-5
- [ ] Dispatch `deploy` with `target=production` from a branch other than `main` → the run fails before any upload → AC-5

## Acceptance-criteria coverage
- AC-1: build outputs, head links, 404 noindex, sitemap · AC-2: dev and preview · AC-3: `check:islands` and the network panel · AC-4: frozen install, `site-check`, ruleset · AC-5: workflow review now, hosted steps after the first preview deploy · AC-6: font requests, CSS sources, glyphs
