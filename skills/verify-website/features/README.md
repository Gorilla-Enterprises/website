# Feature map — website

Feature map for the Gorilla Enterprises landing page (`app/page.tsx`), a
single static route with no interactivity.

## Baseline preconditions

- Launch per `../SKILL.md`'s Launch section; server at `http://localhost:3000`.
- No seed data, no auth, no per-run state — every pass drives the same
  static markup, so features don't need isolated fixtures from each other.
  Only one dev server for this checkout can run at a time (see Isolation
  note in `../SKILL.md`).
- Run the Doctor check first and require `OK` before driving.

## Driving conventions

- Prefer `page.getByRole` / `page.getByText` (accessible name or exact text)
  over CSS selectors — this page has no `data-testid`s.
- Functional assertions: `npm run test:e2e` (`tests/landing.spec.ts`).
- Visual/exploratory checks: `npx playwright screenshot --viewport-size=<W>,<H> ...`.
- This page renders no seeded or user-generated data, so there is nothing to
  remove on cleanup beyond the server process itself.

## Features

- [Landing page render](./landing-render.md) — the mark, wordmark, and
  dateline all render together against the branded dark background.
- [Responsive layout](./responsive-layout.md) — the same content reflows
  correctly and stays full-bleed from phone to desktop widths.
