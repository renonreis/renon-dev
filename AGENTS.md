# renon-dev

## Stack

- **Language / Runtime**: TypeScript (strict), Node 24.22.3 (`.node-version`)
- **Framework**: Astro 7 static build, React 19 islands only where state is needed
- **Key dependencies**: Tailwind 4 (`@tailwindcss/vite`, Paper tokens), GSAP and Lenis (motion, installed when the first scene lands), `@astrojs/sitemap`, Biome
- **Package manager**: pnpm 12.21.0 (`packageManager` in `package.json`)
- **Hosting**: Cloudflare Pages with Git integration, project `renon-dev` (`renon-dev.pages.dev`); every branch gets a preview, a merge into `main` publishes production

## Build approach

Skateboard: ship the whole page with real content and simple motion first, then layer the cinematic motion section by section.

## Commands

```bash
pnpm install --frozen-lockfile   # install
pnpm dev                         # dev server
pnpm build && pnpm preview       # static files in dist/, then serve them
pnpm check && pnpm lint          # astro check (types), Biome (pnpm format fixes)
pnpm test && pnpm test:e2e       # Vitest, then Playwright on the built site
pnpm check:islands               # pages without an island never load React
```

## Specs

Stored in `docs/specs/` as `NNNN-title.md` or `NNNN-title/index.md`. Scope in `docs/scope/scope.md`. The stack is spec 0002.

## Rules

- Functional style: pure functions by default, immutable data (`const`, `readonly`, `as const`), side effects (DOM, network, timers) kept at the edges and explicit.
- No classes where a plain function works; no shared mutable module state, module level values are constants.
- Expected failures return explicit results or `undefined` unions instead of throwing.
- Keep the Astro layout: `src/pages` (routes), `src/layouts`, `src/components`, page sections in `src/components/sections/`.
- Ship zero JavaScript by default. Reach for a React island only for real state, and say which `client:*` directive and why.
- Accessibility baseline is WCAG AA: semantic HTML, one `h1` per page, visible focus, `prefers-reduced-motion` respected by every animation.
- Named exports in `.ts` and `.tsx` modules (Astro components are default exports by design). Files in `kebab-case`, components in `PascalCase`.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `ci:`, `chore:`).
- Tooling: Biome is the only linter and formatter; Biome runs on staged files before each commit; `site-check` in CI runs Biome, `astro check`, the build, `check:islands`, Vitest and Playwright, and is required on `main`.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone
- autonomy: confirm (push and open PRs freely; merging always waits for the engineer's OK)

## Agent skills

- [astro](.agents/skills/astro/): `astrolicious/agent-skills`, Astro components, routing, i18n, islands
- [gsap-core](.agents/skills/gsap-core/): `greensock/gsap-skills`, GSAP tweens and the core API
- [gsap-scrolltrigger](.agents/skills/gsap-scrolltrigger/): `greensock/gsap-skills`, scroll driven scenes and pinning
- [gsap-timeline](.agents/skills/gsap-timeline/): `greensock/gsap-skills`, sequencing with timelines
- [gsap-performance](.agents/skills/gsap-performance/): `greensock/gsap-skills`, keeping motion inside the frame budget
- [cloudflare](.agents/skills/cloudflare/): `cloudflare/skills`, Cloudflare platform and Pages
- [wrangler](.agents/skills/wrangler/): `cloudflare/skills`, the Wrangler CLI
- [web-perf](.agents/skills/web-perf/): `cloudflare/skills`, Core Web Vitals and page weight

MCP servers: paper (connected, design source for tokens and screens)

## Context files

- [src/AGENTS.md](src/AGENTS.md) (site source: route map, tokens, fonts, islands)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
