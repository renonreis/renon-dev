# Site source

## Overview

Everything that ends up in `dist/`: the localized pages, the one shared layout, components and styles. Pages are plain HTML at build time; only islands ship JavaScript.

## Key files

| File                                                           | Owns                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `i18n/routes.ts`                                               | The route map: locales, `lang` values (`en`, `pt-BR`) and each locale's home path           |
| `i18n/content/`                                                | All page copy: `en.ts`, `pt.ts`, untranslated facts in `shared.ts`, `getContent(locale)`    |
| `components/LanguageSwitch.astro`                              | The EN / PT switch; its one `is:inline` script keeps the current `#hash` on switch          |
| `components/HomePage.astro`, `components/sections/`            | The page body both language routes render; one component per page section                   |
| `layouts/BaseLayout.astro`                                     | `lang`, title, description, canonical and hreflang (or `noindex` when `indexable` is false) |
| `pages/index.astro`, `pages/pt/index.astro`, `pages/404.astro` | The routes `/`, `/pt/` and the 404 page                                                     |
| `styles/theme.css`                                             | Tailwind `@theme` tokens pulled from the Paper style board                                  |
| `styles/fonts.css`                                             | Self hosted `@font-face` rules (Latin WOFF2 only)                                           |
| `test/island-check/`                                           | Test only island used by `pnpm check:islands`, never in the real build                      |

## Conventions

- Add a localized page by adding its path to the route map and passing `locale` to `BaseLayout`; never hand write `lang`, canonical or hreflang.
- Use Paper tokens only (`bg-surface`, `text-text-muted`, `font-display`, `text-hero-title`, and so on). Tailwind's default palette, fonts, sizes and radii are reset in `theme.css`. Pull token changes from Paper, don't invent values.
- Font families are "Barlow Condensed" (600, display), "Geist" (400 and 500, body) and "Geist Mono" (400 and 500, labels).
- Every visible string and accessible name comes from `getContent(locale)` or `shared` in `i18n/content/` (spec 0003); no copy literals in components, no `set:html`. Add a key to `types.ts`, then to both `en.ts` and `pt.ts`, or `pnpm check` fails. Content strings are plain text; a link is a separate `{ label, href }`.
- Section ids (`#work`, `#services`, `#about`, `#contact`) are never translated, so the language switch lands on the same section.

## Gotchas

- `trailingSlash` is `always`: link to `/pt/`, not `/pt`. `astro preview` answers 404 for `/pt`, while Cloudflare redirects it.
- Fonts are imported by bare package URL (`@fontsource-variable/geist/files/...woff2`); Vite resolves them. Avoid the fontsource CSS entry points, they pull in every subset or WOFF fallbacks.
- `public/_headers` sends `X-Robots-Tag: noindex` on `*.pages.dev`; keep it until launch moves production to renon.dev.
- A strict Content Security Policy would block the switch's inline script unless its hash is allowed in `public/_headers` (no CSP today).
- Locally, `astro preview` runs in the background and returns at once, so Playwright's `webServer` can report "exited early" while a preview from an earlier run is still up; `pnpm astro preview status` / `stop` manage it. CI is unaffected.

## Related specs

- [0002 static site stack](../docs/specs/0002-static-site-stack/index.md)
- [0003 content model and bilingual copy](../docs/specs/0003-content-model/index.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
