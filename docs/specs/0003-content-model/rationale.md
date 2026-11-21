# 0003. Typed content modules for bilingual copy: rationale

The decision record for [spec 0003](index.md). The build spec is in `index.md`.

## Context

The page is one long, mostly static scroll in two languages (`/` in English, `/pt/` in Portuguese, decided in spec 0002). Sections are built later, in features 6 to 10, and each one needs its copy from the same place in both languages; if copy lives inside components, the two languages drift apart and a missing translation only shows up when someone happens to visit `/pt/`.

The English copy already exists and is approved: it is the copy sheet in the Paper file `renon-dev` (spec 0001). Every factual claim on it traces to the CV and the project READMEs. The Portuguese copy does not exist yet, and the engineer must review both before launch. One card ("Off the clock") still waits on a personal story only the engineer can supply.

The stack is Astro 7, static output, TypeScript strict, functional style, zero JavaScript unless state demands it (root `AGENTS.md`). Titles and descriptions are wired by feature 11, but the scope's rule for this feature is that every word on the page lives in the content source.

Without this decision, each section feature would invent its own copy storage, and the language switch, the hash behaviour on switch and the review flow would be decided ad hoc.

## Options considered

### Option 1: Typed TypeScript modules per locale

A `Content` type, `en.ts` and `pt.ts` that satisfy it, a `shared.ts` for invariant values, and a pure `getContent(locale)` function.

**Pros**:
- A missing or extra key fails `astro check` in CI with no extra tooling.
- No new dependency; fits the functional, immutable style (`as const`, `readonly`).
- One file per language reads like a document for review.

**Cons**:
- Long prose is less pleasant to edit inside TypeScript strings than in Markdown.
- Non developers cannot edit it without touching code.

### Option 2: Astro content collections (YAML or JSON with Zod)

One entry per section per locale, validated by a Zod schema at build time.

**Pros**:
- Data files instead of code; Markdown bodies are natural.
- Schema validation with friendly errors.

**Cons**:
- Parity between locales needs extra code (Zod checks one file, not that both languages have the same keys).
- More moving parts for a page that is almost all short strings.

### Option 3: An i18n library (for example Paraglide)

Message files compiled to typed functions, with tooling for translators.

**Pros**:
- Strong typing and tree shaking; scales to many pages and locales.
- Translator tooling and plural rules.

**Cons**:
- A new dependency and build step for one page in two languages.
- Message keys are flat strings, a poor fit for structured section data (cards, metrics).

## Rationale

The page is short structured copy, not long form content, and the strongest guarantee the engineer asked for is that the two languages cannot drift. Option 1 gets that from the type checker the project already runs in CI, with no new dependency; Option 2 needs custom parity code on top of Zod, and Option 3 brings tooling built for apps with many pages and translators. The cost of Option 1 (prose inside strings, developer only edits) is small here: the engineer is a developer, and review happens in a pull request where the table in the description gives a readable side by side.

Plain text strings with separate link fields keep components free of `set:html`, so a copy edit can never inject markup. Keeping invariant values in `shared.ts` means an email or URL change touches one line, and the type makes it impossible for a translation to quietly change a fact.

For switching, a static link cannot know the current section, so keeping the hash needs a few lines of inline script; a React island for this alone would break the "no JavaScript unless state" rule. Not detecting the visitor's language keeps the page static, indexable and shareable: `/` means English for everyone, and the PT link is always one tap away.
