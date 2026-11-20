# 0001. Cinematic one page design in Paper

**Date**: 2026-11-20 (revised the same day after a cross check by another model)
**Status**: In Progress

## Summary

This spec sets the look and layout of the new renon.dev page before any code exists. The page borrows the rhythm of a cinematic game launch site (a framed hero collage, big rounded cards, condensed uppercase titles, a dark stage) but wears your own identity: your current dark palette and brand accents, Geist type, and your real work. The deliverable is a Paper file with a desktop and a phone screen for every section, a style board that is the single source of every value, and a copy sheet, using labelled placeholder art. You approve it before the build starts, and the approved Paper file then wins over any starting number written here.

## Context

renon.dev today is a single dark page with a typewriter headline, running on WordPress. The new site (scope feature 4) must present ten years of work to recruiters and clients in English and Portuguese, and look striking enough to be remembered. The engineer chose a cinematic game launch website as the reference for structure and motion, and shared screen recordings of it.

Forces: the site is a personal, public, professional page, so it must not carry the reference's names, marks, art, footage or a near identical composition, and every claim on it must be true and sourced. There is no art yet (the scope puts real art in feature 15), so the design must work with placeholders whose sizes are final. The Triquetra design system is deliberately left out for now. No stack is chosen yet (feature 1), so the design must not depend on any framework. Motion, performance and art are separate features (5, 13, 14, 15); this design only annotates them.

Without a written design, `/develop` would invent layout, colour, states and copy section by section, and the page would drift from the reference rhythm and from the engineer's taste.

## Requirements

**User stories**:
- As a recruiter or client, I want to understand in one scroll who Renon is, what he has shipped and how to reach him, so that I can decide to start a conversation.
- As Renon, I want a page that feels cinematic and personal, so that it stands out from template portfolios.

**Acceptance criteria**:
- **AC-1**: A Paper file named `renon-dev` holds eight desktop (1440 wide) and phone (390 wide) artboard pairs in this order: Navbar and Hero (one pair, with the fixed bar's scrolled state shown as an inset), Selected work, Building now, Services, About, Highlights, Clients and proof, Footer. Artboard heights fit their content.
- **AC-2**: A style board in the same file is the single source of every value: colour, gradient and scrim recipes, type roles (size, line height, tracking), radii, spacing, component dimensions and icon sizes, all named. Artboards use only those named values. No Triquetra tokens.
- **AC-3**: Every art slot is a tinted gradient panel in a brand accent, labelled with the intended art, its aspect ratio and "Paper only". Nothing from the reference site appears (names, logos, characters, art, fonts, footage). Client and employer names appear only as plain text facts. No product screenshots of client work; the Sicredi slot is labelled as an original generic banking illustration.
- **AC-4**: A copy sheet artboard holds every English string on the page. Narrative copy (bio, card descriptions, highlights) is first person; UI labels are plain. Every factual claim and number has a row in the Value sourcing table. Every constrained element (nav, pills, tags, metric items, headings) is also checked with draft Portuguese at 390 wide: text wraps and boxes grow, never ellipses or smaller type.
- **AC-5**: The navbar shows the renon.dev wordmark, links to Work, Services, About and Contact (`#work`, `#services`, `#about`, `#contact`) with a current section state, an EN / PT switch showing the current language, and a "Hire me" pill. Bar height is 72 on desktop and 56 on phone. On phone the links and the pill sit in a disclosure menu below the bar (EN / PT stays visible), which closes on link selection or Escape. The pill appears once the hero's bottom clears the bar. Annotations state that a link moves focus to the target section heading, clear of the fixed bar.
- **AC-6**: "Hire me", every "Let's talk" button and the footer contact pill are plain email links to `hello@renon.dev`; the footer shows the address as selectable text plus LinkedIn and GitHub; links that open a new tab are annotated as such; no other footer links.
- **AC-7**: The style board shows default, hover, pressed, focus visible and (where they apply) current and open states for buttons, links, the language switch, the menu and actionable cards. Focus is a 2px contrasting outline with a 2px offset; every target is at least 44 by 44. Only cards that link somewhere take focus. Each section artboard carries its Release 1 motion note, its Release 2 note and its reduced motion behaviour, per the motion map below.
- **AC-8**: Text meets WCAG AA contrast (4.5:1 body, 3:1 large titles, 3:1 for focus outlines and control borders) against its own background, including text placed over art panels, where a scrim or opaque backing is used.
- **AC-9**: The engineer reviews the screens in Paper and approves them; the approval is recorded against the Paper file as it stood (date and a note in this spec's scope row), and any later change goes back through review.
- **AC-10**: Layout rules are annotated on the style board: content max width 1312, the desktop layout from 1024 wide and up, the stacked layout below 1024, gutters 64 desktop and 16 phone, and the page stays usable at 320 wide and at 200% zoom.

## Options considered

### Option 1: Faithful recreation of the reference site

Measure the reference site and rebuild its layout, sizes and timing as closely as possible, swapping in own text and art.

**Pros**:
- Fastest route to a known striking result; every value has an answer.

**Cons**:
- Copies another company's site design for a personal professional page; legal and reputational risk, and it reads as a clone to anyone who knows the reference.
- Locks the page to someone else's identity instead of renon.dev's.

### Option 2: Inspired cinematic layout with your own identity, drawn in Paper

Keep the reference's structure and motion language (framed hero collage, rounded media cards, pinned scenes, alternating wide cards, centred footer), but draw it fresh with renon.dev's palette, type and content, with its own collage composition and section rhythm.

**Pros**:
- Keeps what made the reference compelling while staying clearly original.
- Continuity with the current renon.dev identity.
- Paper screens give a reviewable, final looking target before any code.

**Cons**:
- Every size and colour is a design call to make and review, not a measurement.
- More design effort up front than evolving the current page.

### Option 3: Evolve the current minimal page

Keep today's single screen typewriter look and add simple sections below it.

**Pros**:
- Least work, no new visual language.

**Cons**:
- Does not deliver the cinematic, memorable page the engineer asked for.

## Decision

**Chosen option**: Option 2: Inspired cinematic layout with your own identity, drawn in Paper.

The page is designed in Paper as a dark, cinematic one page in renon.dev's own palette and type, following the section map, copy rules and motion map below, with labelled placeholder art. Numbers given here are starting values; the approved Paper file is the source of truth for the build.

## Rationale

The engineer wants the impact of the reference, but the page is their real professional front door. Option 1 delivers the impact while putting a copy of someone else's design under their name, which is exactly the wrong signal for a senior engineer and a liability on a public site. Option 3 avoids all risk and loses the point of the redesign.

Option 2 keeps the parts of the reference that create the effect (scale, framing, rhythm, motion) and nothing that identifies it. Reusing the current palette and Geist keeps continuity with renon.dev and saves inventing a brand. Designing with final size placeholders lets the build start before any art exists, which is what the Skateboard approach needs: ship the whole page early, then layer motion and art.

Calls made here (engineer delegated): the condensed display face is Barlow Condensed (free, wide weight range, reads well in uppercase at large sizes; runner up Oswald, heavier and less refined at small sizes). Copy is drafted in English for the screens; Portuguese is drafted only to fit check constrained elements (reviewed bilingual copy is feature 3). Accent per section rotates through the four brand colours so the page has rhythm without new colours. A cross check by another model asked for fixed pixel geometry for every slot; the spec takes those numbers as starting values instead, because fixing every pixel before drawing would freeze design choices that the Paper review exists to make.

## Feature design

**Section map and content** (in page order; starting geometry, Paper wins):

| # | Section | Layout | Content | Accent |
|---|---|---|---|---|
| 1 | Navbar | Fixed bar, 72 desktop / 56 phone: wordmark left; links, EN / PT and "Hire me" right; phone: menu button opens the disclosure | Wordmark "renon.dev" (dot in the section accent) | follows section |
| 2 | Hero (`#top`) | Framed collage of 8 slots: desktop 4 by 2 grid in a 1104 by 624 frame, phone 2 by 4 grid in 358 by 480 with its own crops; wordmark centred over a scrim. Below: tagline, "Hire me", tech tags (tags wrap on phone) | Tagline "Senior Software Engineer & Tech Lead" / "Curitiba, Brazil · remote". Tags: TypeScript, React, Next.js, Node.js. Slots in order: Photo: you · Curitiba at dusk · Your desk · Illustration: banking app · Design system components · Illustration: print products · Team at work · Code close up | violet `#b794ff` |
| 3 | Selected work (`#work`) | Eyebrow "Portfolio", title "Selected work"; one featured card (art 16:6) then two cards (art 4:5); phone: one column, art 4:3 above text | Each card: client, project, my role, stack, outcome. Featured: Sicredi Internet Banking (Tech Lead; React 19, TypeScript, Zustand, Tailwind; transaction history micro frontend, rolled out to the full retail user base in October 2026). Sicredi Core Web design system (built 25+ of about 70 components; React, TypeScript, Tailwind, Storybook; AAA contrast targets, screen reader tested). Printi e-commerce (Senior Software Engineer in the core team; React, Next.js, Node.js; helped grow active users 40%, sessions 50% and average order value about 20%). Cards are not links | coral `#f97b7c` |
| 4 | Building now | Label "Building now"; two equal cards, art 16:9; phone: one column | Triquetra: my accessible React design system, tokens and components, docs at triquetra.renon.dev. Project Zero Dawn: my agentic engineering workflow, decisions written in the repo and run by AI agents. Each tagged "Open source", linking out | blue `#71a2f0` |
| 5 | Services (`#services`) | Text only cards: desktop one large card and two stacked (2:1 split); phone: one column | Full product builds: Next.js and Node.js products, designed and shipped end to end. Tech leadership: I lead frontend squads, set standards and bring AI assisted workflows. Frontend rescue: performance, accessibility and code health for an existing product. Each with "Let's talk" | violet |
| 6 | About (`#about`) | Backdrop slot 16:9 desktop ("Video: Curitiba at dusk"), title "Curitiba, Brazil." and bio on an opaque scrim; phone: art 4:3 above text | Bio from the CV summary in first person: 10 years in web development, TypeScript, React, Next.js, design systems, banking and e-commerce, accessibility, Tech Lead | blue |
| 7 | Highlights | Two wide cards, art 2:1 desktop, text left then right; phone: art 4:3 above text | "Open to conversations": I'm Tech Lead at Raio, open to new opportunities and freelance work; button "Hire me". "Off the clock": personal anecdote, placeholder marked TBD (content reviewed in feature 3) | coral, green `#5c985a` |
| 8 | Clients and proof (`#contact` anchor is the footer, not here) | Header "Clients"; names wrap as a text row; metric strip, phone 2 by 2 grid | Names: Sicredi, Printi, Contabilizei, Meiuca, Raio. Metrics: 10 years · 25+ design system components · about 20% higher average order value · full Sicredi retail user base | green |
| 9 | Footer (`#contact`) | Centred: wordmark, contact pill "Let's build something" with the email, socials row, © line | Email (selectable), LinkedIn, GitHub; EN / PT; "© <year of publication> Renon Reis" | neutral |

**Style board** (normative; the only source of values, AC-2):
- Colour: surface `#161616`, raised surface `#1f1f22`, text `#eeeef0`, muted text `#a6a6a6`, accents violet `#b794ff`, coral `#f97b7c`, blue `#71a2f0`, green `#5c985a`. Recipes to name on the board: placeholder gradient (accent to surface), art scrim (surface at a stated opacity), hairline border (text at a stated low opacity), cursor glow (accent, stated opacity and blur).
- Type roles, each with size, line height and tracking on the board: hero title, section title, card title (Barlow Condensed SemiBold uppercase; starting sizes desktop 120 / 72 / 48, phone 56 / 40 / 32); body large, body, small (Geist 18 / 16 / 14); eyebrow and tag (Geist Mono 12 to 14 uppercase).
- Shape: cards radius 24 (phone 16), pills fully rounded.
- Spacing: 8 point grid; section gap 160 desktop, 96 phone; card padding, gaps and icon sizes named on the board.
- Components with all states (AC-7): navbar, menu disclosure, pill button (primary and ghost), text link, language switch, media card, text card, metric item, tech tag, placeholder panel.

**Motion map** (annotated per section, AC-7; built in features 5, 13 and 14):
- Release 1, every section: one reveal on entry (fade with an 8px rise, 200 ms); content is fully visible without scripts; the "Hire me" pill appears as described in AC-5; cursor glow on fine pointers only.
- Release 2: Hero, loader into the layered collage intro (skipped on deep links and on any interaction). Selected work, the section pins while its cards rise. About, the backdrop scrubs with the scroll. Highlights, art parallax. Building now, Services, Clients and Footer keep the Release 1 reveal.
- Reduced motion: no pinning, scrubbing, parallax or intro; static first frames; everything visible.

**Data model sketch**: not applicable to the design. All text on the artboards is draft copy on the copy sheet; the structured, bilingual content source and the language URLs are decided in feature 3.

**API surface**: not applicable (static page, no endpoints). Outbound links only:

| Link | Target | Opens |
|---|---|---|
| Hire me, Let's talk, footer pill | `mailto:hello@renon.dev` | mail client |
| LinkedIn | linkedin.com/in/renonreis | new tab |
| GitHub | github.com/renonreis | new tab |
| Triquetra card | triquetra.renon.dev | new tab |
| Zero Dawn card | github.com/renonreis/project-zero-dawn | new tab |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Hero | role, location, tech tags | CV "Senior Software Engineer - EN", Google Doc `14X9hGJxsWozcqvFnFLZvmqmJlwwdtMNkHNoEwn6CYvM`, as of 2026-11-17 (PT twin `1bZbfsI8pk15REn8D07E4F9st-2rBmSlV0tiMkVyP8vI`) |
| Selected work | roles, stacks, Sicredi rollout (full retail user base, October 2026), 25+ of about 70 components, Printi +40% active users, +50% sessions, about 20% AOV | same CV, Raio (Sicredi) and Meiuca (Printi) entries; Printi figures are team outcomes Renon helped deliver and are worded "helped" |
| Building now | Triquetra description, docs URL; Zero Dawn description | `renonreis/triquetra-design-system` README and `renonreis/project-zero-dawn` README as of 2026-11-20 |
| Services | names and descriptions | engineer's choice in the design conversation, wording drafted from the CV |
| About, Proof | 10 years, bio | CV summary of qualifications |
| Clients | client and employer names | CV experience entries |
| Highlights | availability line | engineer's choice: open to conversations while Tech Lead at Raio |
| Highlights | Off the clock anecdote | placeholder in the design; the engineer supplies it during the feature 3 content review (does not block AC-9) |
| Links | email | `hello@renon.dev`, confirmed by the engineer on 2026-11-20; the engineer sets up the mailbox before launch |
| Links | LinkedIn, GitHub | CV contact line |
| Palette | colour values | current renon.dev theme tokens (`renonreis/renon.dev`, theme `resources/css/tokens/primitives/colors.scss`) |

**Key invariants**:
- Nothing from the reference site (names, logos, characters, art, fonts, footage), and the collage composition and section rhythm differ visibly from it.
- Every factual claim and number on the page has a Value sourcing row.
- The approved Paper file is the source of truth for geometry and values; this spec's numbers are starting points.

**Security model**: public page, no user data, no sign in. The contact address is published by the engineer's choice; spam handling is noted under Consequences.

**Critical test scenarios**:
- Happy path: walk desktop then phone artboards top to bottom, all eight pairs present in order with copy from the copy sheet, verifies **AC-1**, **AC-4**.
- Portuguese fit: nav, pills, tags, metric items and headings at 390 wide with Portuguese draft text wrap without ellipses, verifies **AC-4**.
- Phone nav: the disclosure artboard shows links, the pill and Escape or selection closing it, verifies **AC-5**.
- Contrast: bio over the About scrim, titles over art panels and focus outlines measured at or above AA, verifies **AC-7**, **AC-8**.
- Originality: no reference names or imagery in the file, and a side by side with the recordings shows a different collage and rhythm, verifies **AC-3**.

## Build plan

Skateboard: the first usable result is the whole page in rough but complete form, then each part is refined. Built in Paper, not in code.

1. Create the `renon-dev` Paper file, the style board (values, type roles, components with all states, layout rules) and the copy sheet in English, satisfies **AC-2**, **AC-4**, **AC-7**, **AC-10**
2. Draft every section at desktop width in page order with copy from the copy sheet and labelled placeholders, satisfies **AC-1**, **AC-3**, **AC-5**, **AC-6**
3. Draw the phone artboard for every section, including the menu disclosure, and fit check constrained elements in Portuguese, satisfies **AC-1**, **AC-4**, **AC-5**
4. Annotate the motion map on each section and check contrast, satisfies **AC-7**, **AC-8**
5. Review with the engineer, apply changes, and record the approval, satisfies **AC-9**

## Consequences

**Positive**:
- `/develop` builds each section from an approved screen instead of inventing layout, states and copy.
- Placeholder slots at final sizes let the build start before any art exists.
- The page stays original, on brand and factually sourced.

**Negative / tradeoffs**:
- Sizes and timings are design judgment, not measured values; expect a round of tuning once motion is built.
- Drafted copy needs your edit, and reviewed bilingual copy is still owed (feature 3).
- A public email address attracts spam; the build may obscure it from simple scrapers.
- Leaving Triquetra out now means a later pass to align tokens if you adopt it.

**Neutral**:
- Barlow Condensed becomes a new font dependency next to Geist.

**Constraints handed to later features** (from the cross check):
- Feature 3: English at `/` and Portuguese at `/pt/`, the section hash kept on language switch, correct document language, and the current language exposed to assistive tech.
- Feature 5: native scroll and DOM order kept; focus never hidden under the fixed bar; glow off for coarse pointers; all nonessential motion off under reduced motion.
- Feature 13 and 14: intro skipped on deep links or interaction; one active video at a time, posters as fallback on reduced data, errors or poor playback; a pause control for sustained moving media; release 2 only ships if mobile LCP is 2.5 s or less, INP 200 ms or less and CLS 0.1 or less.
- Feature 15: contrast tested again with final art in both languages; opaque text backing wherever the worst crop cannot guarantee AA; decorative media marked decorative, alt text only where art carries information.
- Feature 12: the chosen renon.dev address must receive mail before launch.

## Follow-up

- [ ] You supply the facts for the "Off the clock" card during the feature 3 content review.
- [ ] You set up the `hello@renon.dev` mailbox before launch (feature 12).
