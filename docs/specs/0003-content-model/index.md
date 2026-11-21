# 0003. Typed content modules for bilingual copy

**Date**: 2026-11-20
**Status**: In Progress

## Summary

Every word on the page will live in plain TypeScript files, one for English and one for Portuguese, both checked against one shared shape, so a missing text in either language breaks the build instead of reaching visitors. Things that never change between languages (email, links, client names, stacks, the year) live once in a shared file. The English text is the copy sheet you approved in Paper; the Portuguese is drafted from it with the terms of your Portuguese CV, and you review both in a pull request. A small language switch keeps you on the same section when you change language, and nothing guesses your language for you.

## Requirements

**User stories**:
- As a visitor, I want to read the whole page in English or Portuguese and switch between them without losing my place, so that I can follow it in the language I prefer.
- As Renon, I want every word in one reviewable place per language, with the build refusing a missing translation, so that the two languages never drift.
- As a builder of features 6 to 10, I want each section to read typed copy for its locale, so that I never hard code text in a component.

**Acceptance criteria**:
- **AC-1**: Every visible string and every accessible name on `/`, `/pt/` and the 404 page, plus each page's `<title>` and meta description, comes from the content source (a locale file or `shared.ts`, including the wordmark and the `EN` / `PT` labels). No copy string literals remain in `.astro` or `.tsx` components (the placeholder copy in `ScaffoldPlaceholder.astro` is removed). The only exception is purely decorative glyphs (`↗`, `·`), which carry `aria-hidden="true"`. The 404 page stays a single page (Cloudflare serves one `404.html`): it renders the English `notFound` block and the Portuguese one (wrapped in `lang="pt-BR"`), each with a link back to its own language's home, and its `<title>` is `en.notFound.title`.
- **AC-2**: `en.ts` and `pt.ts` each export a value that `satisfies Content`. Removing or misspelling a key in either file makes `pnpm check` fail.
- **AC-3**: Values that do not change between languages (email, outbound URLs, client and employer names, stack lists, tech tags, the copyright year) exist only in `shared.ts`, and no locale file repeats them.
- **AC-4**: The English strings match the approved Paper copy sheet (file `renon-dev`, page Foundations, artboard "Copy sheet"). The Portuguese strings are drafted from them with the Portuguese CV's terms, keeping job titles and trade terms in English as the CV does ("Tech Lead", "design system", "micro frontend", stack names).
- **AC-5**: Content strings are plain text: no HTML and no Markdown. A link is a separate `{ label, href }` (href from `shared.ts`), and components never use `set:html` for content.
- **AC-6**: Both language pages show an EN / PT switch: two links with `hreflang` and `lang`, the current one marked `aria-current="page"` and visibly current, an accessible group name from the content, and each target at least 44 by 44. Without JavaScript each link goes to the other language's home (`/` or `/pt/`).
- **AC-7**: With JavaScript, following the switch keeps the current hash: from `/#work` the PT link opens `/pt/#work`, and from `/pt/#about` the EN link opens `/#about`. The script is inline, ships no framework, and adds no other behaviour.
- **AC-8**: Nothing detects or redirects by language: `/` always serves English and `/pt/` always Portuguese, whatever the browser's language.
- **AC-9**: The "Off the clock" copy is optional. When it is absent, the card is not rendered in either language; a test fails if one locale has it and the other does not.
- **AC-10**: The footer year is the build year, computed once in `shared.ts`, and the copyright line is built from it in both languages.
- **AC-11**: The engineer reviews the copy in a pull request whose description holds an EN | PT table per section; the review outcome (date and a short note) is recorded on feature 3 in the scope before the feature is marked done.
- **AC-12**: Each locale's content holds the page title, meta description and OG image alt text, and `BaseLayout` reads the title and description from it; feature 11 only adds the remaining head and OG wiring.

## Decision

**Chosen option**: Option 1: Typed TypeScript modules per locale.

All page copy lives in `src/i18n/content/` as typed modules (`types.ts`, `shared.ts`, `en.ts`, `pt.ts`, `index.ts`), read through a pure `getContent(locale)`; a small `LanguageSwitch.astro` with an inline hash script handles switching.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`)

## Feature design

**Data model sketch** (TypeScript types, all fields `readonly`, all strings required unless marked optional):

| Type | Fields | Notes |
|---|---|---|
| `Locale` | `"en" \| "pt"` | from `src/i18n/routes.ts` (spec 0002), unchanged |
| `Content` | `meta`, `nav`, `languageSwitch`, `hero`, `work`, `now`, `services`, `about`, `highlights`, `clients`, `footer`, `notFound` | one per locale; `en` and `pt` `satisfies Content` |
| `meta` | `title`, `description`, `ogImageAlt` | read by `BaseLayout` (title, description); OG alt for feature 11 |
| `nav` | `work`, `services`, `about`, `contact`, `hireMe`, `menuOpen`, `menuClose` | link targets `#work` etc. are fixed anchors, not copy; `hireMe` links to `mailto:` + `shared.email` |
| `languageSwitch` | `groupLabel`, `names: { en, pt }` | visible labels `EN` / `PT` come from `shared.localeLabels`; `names` are the accessible names ("English", "Português") |
| `hero` | `role`, `roleAccent`, `location` | role split so "& Tech Lead" can take the accent; tags come from `shared.ts` |
| `work` | `eyebrow`, `title`, `labels: { role, stack, outcome }`, `items: readonly WorkItem[]` | |
| `WorkItem` | `id: WorkId`, `title`, `body`, `role`, `outcome?`, `artLabel` | `id` keys into `shared.work[id]` for client name and stack; `artLabel` is the decorative art description, not rendered as alt (art is decorative) |
| `now` | `title`, `tag`, `newTab`, `items: readonly NowItem[]` | `newTab` is the "opens in a new tab" hint |
| `NowItem` | `id: NowId`, `title`, `body` | `id` keys into `shared.now[id].href` |
| `services` | `eyebrow`, `title`, `cta`, `items: readonly [Service, Service, Service]` | `Service = { title, body }`; the tuple makes "exactly three" a type error, not a test |
| `about` | `eyebrow`, `title`, `bio: readonly string[]` | one string per paragraph |
| `highlights` | `open: { eyebrow, title, body, cta }`, `offTheClock?: { eyebrow, title, body }` | optional per AC-9 |
| `clients` | `title`, `metrics: readonly { figure, label }[]` | names from `shared.clients` |
| `footer` | `pill`, `newTab`, `copyright: (year: number) => string` | the one function field: word order differs by language |
| `notFound` | `title`, `body`, `backHome` | the 404 copy; the single 404 page renders both locales' blocks (AC-1) |
| `shared` (module, `as const`) | `wordmark`, `localeLabels: { en, pt }`, `notFoundCode`, `email`, `links: { linkedin, github }`, `work: Record<WorkId, { client, stack }>`, `now: Record<NowId, { href }>`, `clients`, `heroTags`, `buildYear` | `wordmark = "renon.dev"`, `localeLabels = { en: "EN", pt: "PT" }`, `notFoundCode = "404"`; `buildYear = new Date().getFullYear()` evaluated once at build (tests compare against `shared.buildYear`, so they stay deterministic) |

Relationships: `WorkItem.id` and `NowItem.id` are string literal unions (`WorkId = "sicredi-banking" | "sicredi-core-web" | "printi"`, `NowId = "triquetra" | "zero-dawn"`), so a locale cannot reference an item `shared.ts` lacks, and order is the order of the locale's array. No persistence, no state machine.

**State transitions**: not applicable.

**API surface** (module functions and components, no HTTP endpoints):

| Function / component | Signature | Inputs | Output | Notes |
|---|---|---|---|---|
| `getContent` | `(locale: Locale) => Content` | locale from the page | the locale's content | pure lookup; `src/i18n/content/index.ts` |
| `shared` | `const` export | none | invariant values | `src/i18n/content/shared.ts` |
| `LanguageSwitch.astro` | props `{ locale: Locale }` | current locale | `<nav>` group with two links | targets from `homePath` in `routes.ts`; one inline script at the end of the component listens for clicks on its two links and, when `location.hash` is not empty, navigates to the link's `href` plus that hash; with an empty hash the link behaves normally (AC-7) |
| `BaseLayout.astro` | existing props, `title` and `description` now from `getContent(locale).meta` | locale | head tags | pages stop passing literal strings |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Render any section, EN | every English string | Paper `renon-dev` copy sheet as approved under spec 0001, which traces each fact to spec 0001's Value sourcing table |
| Render any section, PT | every Portuguese string | drafted from the English strings, terms from the PT CV (Google Doc `1bZbfsI8pk15REn8D07E4F9st-2rBmSlV0tiMkVyP8vI`), reviewed by the engineer in the PR (AC-11) |
| Render contact, Hire me, Let's talk, footer pill | `hello@renon.dev` and the link `mailto:hello@renon.dev` | `shared.email`, confirmed by the engineer on 2026-11-20 (spec 0001); the component builds the `href` as `mailto:` + `shared.email`, never a literal |
| Render wordmark, `EN` / `PT` labels, 404 code | `renon.dev`, `EN`, `PT`, `404` | `shared.wordmark`, `shared.localeLabels`, `shared.notFoundCode` (do not translate) |
| Render footer socials, Building now links | LinkedIn, GitHub, Triquetra and Zero Dawn URLs | `shared.links` / `shared.now`, values from spec 0001's API surface table |
| Render work cards, clients row, hero tags | client names, stacks, tags | `shared`, values from the copy sheet (CV entries) |
| Render footer copyright | year | `shared.buildYear`, the year at build time (engineer's choice, this spec) |
| Render "Off the clock" | title and body | engineer, during the copy review; absent until then (AC-9) |
| Switch language | target URL | `homePath[otherLocale]` from `routes.ts` plus `location.hash` at click time (AC-7) |
| Mark current language | `aria-current` | the page's `locale` prop |
| Head tags | title, description | `getContent(locale).meta` (drafted here, refined in feature 11) |

**Key invariants**:
- `en` and `pt` have exactly the same keys (type enforced) and the same optional fields present (test enforced for `offTheClock`).
- A fact appears in one place: invariant values only in `shared.ts`; locale files hold words, not facts that do not translate.
- Content values are plain strings (or the one `copyright` function); no markup.
- Content modules are pure: no imports beyond types and `shared.ts`, no side effects except computing `buildYear` once.
- Section ids (`#work`, `#services`, `#about`, `#contact` and the others) are never translated: both pages use the same ids, so the hash kept by the switch (AC-7) lands on the same section.

**Security model**: public, static content; no user input. The only risk is markup injection through copy, closed by AC-5 (plain text, no `set:html`). The published email is the engineer's choice (spec 0001).

**Critical test scenarios**:
- Type parity: delete `nav.about` from `pt.ts` → `pnpm check` fails, verifies **AC-2**.
- Shared once: a Vitest test asserts no locale string equals `shared.email` or a `shared` URL, verifies **AC-3**.
- No markup: a Vitest test walks every string in both locales and rejects `<`, `](` and `**`, verifies **AC-5**.
- Optional parity: a Vitest test fails when exactly one locale defines `highlights.offTheClock`, verifies **AC-9**.
- No literals: a Playwright test on the built `/`, `/pt/` and `404.html` collects every non empty text node and every accessible name (`aria-label`, `alt`, `title`) outside `aria-hidden` elements, plus `<title>` and the meta description, and fails if any is not a value from that locale's content or `shared` (for the 404, either locale), verifies **AC-1**.
- Section ids: a Playwright test asserts `/` and `/pt/` expose the same set of section ids, verifies **AC-7**.
- Switch without JS: Playwright with JavaScript disabled clicks PT on `/` and lands on `/pt/`, verifies **AC-6**.
- Switch keeps hash: Playwright opens `/#work`, clicks PT, expects `/pt/#work`; and back from `/pt/#about` to `/#about`, verifies **AC-7**.
- No redirect: Playwright with `Accept-Language: pt-BR` opens `/` and gets English (`lang="en"`), verifies **AC-8**.
- Year: unit test that the copyright line in both locales contains `shared.buildYear`, verifies **AC-10**.
- Head: Playwright reads `<title>` on `/` and `/pt/` and matches each locale's `meta.title`, verifies **AC-12**.

## Build plan

Skateboard: the whole content source lands first and the existing page reads it end to end in both languages, then the switch and the checks harden it.

1. Write `types.ts` (`Content`, `WorkId`, `NowId`, the three item services tuple) and `shared.ts` (wordmark, locale labels, 404 code, email, links, clients, stacks, tags, `buildYear`), satisfies **AC-2**, **AC-3**, **AC-10**
2. Write `en.ts` from the Paper copy sheet, every section plus `meta`, `languageSwitch` and `notFound`, satisfies **AC-4**, **AC-5**, **AC-12**
3. Draft `pt.ts` from `en.ts` with the PT CV terms and the glossary rule, leaving `offTheClock` out of both, satisfies **AC-2**, **AC-4**, **AC-9**
4. Add `getContent`, make `BaseLayout` read `meta`, replace the scaffold placeholder with a minimal page that renders the hero copy (wordmark, role, location, Hire me as a `mailto:` link) from the content, make the single 404 page render both locales' `notFound` blocks, and delete the placeholder strings, satisfies **AC-1**, **AC-12**
5. Build `LanguageSwitch.astro` with the inline hash script and place it on both pages, satisfies **AC-6**, **AC-7**, **AC-8**
6. Add the Vitest checks (shared once, no markup, optional parity, year, no literals) and the Playwright checks (no literals, switch with and without JS, hash, section ids, no redirect, titles), satisfies **AC-1**, **AC-3**, **AC-5**, **AC-6** to **AC-10**, **AC-12**
7. Open the review pull request with the EN | PT table per section, apply the engineer's edits (and the "Off the clock" story if supplied), and record the review on feature 3 in the scope, satisfies **AC-4**, **AC-9**, **AC-11**

## Consequences

**Positive**:
- Features 6 to 10 build sections by reading `getContent(locale)`; no section invents copy or storage.
- A missing translation fails CI before it reaches a visitor.
- Facts that do not translate cannot drift between languages.

**Negative / tradeoffs**:
- Long text inside TypeScript strings is slightly awkward to edit.
- Hash preservation depends on a few lines of inline script; without JavaScript the switch lands at the top of the other page.
- The "Off the clock" card stays hidden until the engineer supplies the story.
- If feature 12 turns on a strict Content Security Policy, the switch's inline script needs its hash allowed in `public/_headers` (no CSP is set today).

**Neutral**:
- `ScaffoldPlaceholder.astro` is removed; the scaffold page becomes a minimal hero until feature 6.
- `src/AGENTS.md` gains a convention (copy comes only from `src/i18n/content/`), to be added by `/sync` after the build.
- Feature 11 keeps ownership of OG images, structured data and the final wording of title and description; it edits them in the content files.

## Follow-up

- [ ] You supply the "Off the clock" story (both languages, or English and I translate) during the copy review.
- [ ] Feature 6: the navbar and footer render `LanguageSwitch.astro` instead of the scaffold placement.

The context, the options weighed and the reasoning live in [rationale.md](rationale.md).
