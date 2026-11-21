# Verify: content model & bilingual copy · spec 0003 · updated 2026-11-21
_Steps derived from spec 0003 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Run `pnpm build && pnpm preview`, open `/` → the hero shows `renon.dev` (h1), "Senior Software Engineer", "& Tech Lead", "Curitiba, Brazil · remote", the four tags and "Hire me" → AC-1
- [ ] Open `/pt/` → the same hero in Portuguese ("Engenheiro de Software Sênior", "e Tech Lead", "Curitiba, Brasil · remoto", "Me contrate"); tags and wordmark unchanged → AC-1, AC-4
- [ ] Open `/this-page-does-not-exist/` → 404 page shows "404", the English block (h1 "Page not found", link to `/`) and the Portuguese block (`lang="pt-BR"`, link to `/pt/`); tab title is "Page not found" → AC-1
- [ ] Inspect "Hire me" on both pages → `href="mailto:hello@renon.dev"` → Value sourcing (email from `shared.email`)
- [ ] On `/`, inspect the EN / PT switch → a `nav` named "Language" with two links, EN has `aria-current="page"` and the light fill, each link 44 × 44 or bigger, `hreflang` and `lang` set; on `/pt/` the group is named "Idioma" and PT is current → AC-6
- [ ] Tab to the switch on both pages → visible focus ring on each link → AC-6
- [ ] Disable JavaScript, open `/#work`, press PT → lands on `/pt/` (top of page) → AC-6
- [ ] With JavaScript, open `/#work`, press PT → lands on `/pt/#work`; open `/pt/#about`, press EN → lands on `/#about` → AC-7, Value sourcing (target URL)
- [ ] With JavaScript and no hash, press PT on `/` → lands on `/pt/`; Cmd or Ctrl click PT from `/#work` → opens `/pt/` in a new tab, no script interference → AC-7
- [ ] Set the browser language to Portuguese, open `/` → English page, no redirect → AC-8
- [ ] View source of `/` → the only script is the small inline switch script, no `/_astro/*.js` request → AC-7
- [ ] Tab titles: `/` shows "Renon Reis · Senior Software Engineer & Tech Lead", `/pt/` shows "Renon Reis · Engenheiro de Software Sênior e Tech Lead"; meta descriptions match each locale's `meta.description` → AC-12, Value sourcing (head tags)

## Commands
- [ ] `pnpm check` → 0 errors → AC-2
- [ ] Delete `about: "Sobre",` from `src/i18n/content/pt.ts`, run `pnpm check` → fails with "Property 'about' is missing"; restore the line → AC-2
- [ ] Add a stray key (for example `nav.blog: "Blog"`) to `en.ts`, run `pnpm check` → fails (excess property); remove it → AC-2
- [ ] `grep -rn "hello@renon.dev\|linkedin.com\|github.com" src/i18n/content/en.ts src/i18n/content/pt.ts` → no matches → AC-3
- [ ] `grep -rn "set:html" src` → no matches → AC-5
- [ ] `pnpm test` → all green (shared once, no markup, optional parity, year, no literals in components) → AC-1, AC-3, AC-5, AC-9, AC-10
- [ ] Add `offTheClock: { eyebrow: "x", title: "x", body: "x" }` to `en.ts` only, run `pnpm test` → the AC-9 parity test fails; remove it → AC-9
- [ ] `pnpm build`, then `grep -o "© [0-9]*" dist/index.html` once feature 6 renders the footer → the current year; until then `pnpm test` covers the copyright line from `shared.buildYear` → AC-10, Value sourcing (year)
- [ ] `pnpm test:e2e` → all green on desktop and mobile → AC-1, AC-6, AC-7, AC-8, AC-12
- [ ] `pnpm check:islands` → "AC-3 holds" (no React on the real pages) → AC-7

## Review
- [ ] PR #5 holds an EN | PT table per section; the engineer's review outcome (date and a short note) is recorded on feature 3 in `docs/scope/scope.md` → AC-11
- [ ] English strings match the Paper copy sheet (file `renon-dev`, Foundations, "Copy sheet"); Portuguese keeps "Tech Lead", "design system", "micro frontend" and stack names in English → AC-4, Value sourcing (EN and PT strings)
- [ ] "Off the clock" is absent in both locales until the engineer supplies it, and the card is not rendered → AC-9, Value sourcing (Off the clock)

## Acceptance-criteria coverage
- AC-1: hero, 404 and hash steps (UI); `pnpm test`, `pnpm test:e2e`
- AC-2: the two `pnpm check` mutation steps
- AC-3: the grep step; `pnpm test`
- AC-4: the hero PT step; copy review
- AC-5: the `set:html` grep; `pnpm test`
- AC-6: switch inspection, focus, no JS steps; `pnpm test:e2e`
- AC-7: hash steps, view source; `pnpm test:e2e`, `pnpm check:islands`
- AC-8: Portuguese browser step; `pnpm test:e2e`
- AC-9: the parity mutation step; copy review
- AC-10: year step; `pnpm test`
- AC-11: PR #5 review recorded in the scope
- AC-12: tab titles step; `pnpm test:e2e`
