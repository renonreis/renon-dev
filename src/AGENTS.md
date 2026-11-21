# Site source

## Overview

Everything that ends up in `dist/`: the localized pages, the one shared layout, components and styles. Pages are plain HTML at build time; only islands ship JavaScript.

## Key files

| File                                                           | Owns                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `i18n/routes.ts`                                               | The route map: locales, `lang` values (`en`, `pt-BR`) and each locale's home path           |
| `layouts/BaseLayout.astro`                                     | `lang`, title, description, canonical and hreflang (or `noindex` when `indexable` is false) |
| `pages/index.astro`, `pages/pt/index.astro`, `pages/404.astro` | The routes `/`, `/pt/` and the 404 page                                                     |
| `styles/theme.css`                                             | Tailwind `@theme` tokens pulled from the Paper style board                                  |
| `styles/fonts.css`                                             | Self hosted `@font-face` rules (Latin WOFF2 only)                                           |
| `test/island-check/`                                           | Test only island used by `pnpm check:islands`, never in the real build                      |

## Conventions

- Add a localized page by adding its path to the route map and passing `locale` to `BaseLayout`; never hand write `lang`, canonical or hreflang.
- Use Paper tokens only (`bg-surface`, `text-text-muted`, `font-display`, `text-hero-title`, and so on). Tailwind's default palette, fonts, sizes and radii are reset in `theme.css`. Pull token changes from Paper, don't invent values.
- Font families are "Barlow Condensed" (600, display), "Geist" (400 and 500, body) and "Geist Mono" (400 and 500, labels).
- Placeholder copy lives in `components/ScaffoldPlaceholder.astro` until feature 3 brings the content source.

## Gotchas

- `trailingSlash` is `always`: link to `/pt/`, not `/pt`. `astro preview` answers 404 for `/pt`, while Cloudflare redirects it.
- Fonts are imported by bare package URL (`@fontsource-variable/geist/files/...woff2`); Vite resolves them. Avoid the fontsource CSS entry points, they pull in every subset or WOFF fallbacks.
- `public/_headers` sends `X-Robots-Tag: noindex` on `*.pages.dev`; keep it until launch moves production to renon.dev.

## Related specs

- [0002 static site stack](../docs/specs/0002-static-site-stack/index.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
