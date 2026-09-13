# Responsive layout

The landing page is full-screen (`h-screen`/`h-full` on `<html>`/`<body>`,
`flex-1` on `<main>`) with no fixed-width elements, and must reflow cleanly
from phone to desktop widths with no horizontal scroll or clipped content.

## Sub-features

- `no-h-scroll` — the page never introduces horizontal scroll at any width.
- `full-bleed` — content stays centered and the dark background fills the
  viewport at every width (no unstyled margin strip).
- `mark-scales` — the brand mark shrinks at narrow widths (`h-24` below the
  `sm` breakpoint, `sm:h-28` at/above it — see `app/page.tsx`).

## How to reach it (user POV)

- Load `/` at any viewport width — there is no separate mobile route or
  breakpoint-gated content, only CSS reflow.

## Driving it with Playwright

Preconditions:

- Website is healthy at `http://localhost:3000` (Doctor check passes).

- **Desktop.** Run
  `npx playwright screenshot --viewport-size=1440,900 http://localhost:3000 desktop.png`.
  Mark, wordmark, and dateline are centered with generous surrounding space;
  no scrollbar.
- **Mobile.** Run
  `npx playwright screenshot --viewport-size=390,844 http://localhost:3000 mobile.png`.
  Same content, mark visibly smaller, still centered, still no horizontal
  scroll.
- **Assert no horizontal scroll programmatically** (script, not CLI screenshot):
  `page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)`
  should be `true` at both widths above.
- **Proof.** Both screenshots side by side — open them and look; a
  horizontal-scroll regression is visible as content or background cut off
  at the viewport edge, not something the assertion alone always catches at
  every possible width.

## Gotchas

- Don't rely on the desktop screenshot alone — the failure mode this feature
  guards against (overflow, clipped mark, wordmark wrapping badly) only shows
  up at narrow widths.
- `--viewport-size` on `npx playwright screenshot` takes `WIDTH,HEIGHT` as one
  shell argument, e.g. `--viewport-size=390,844` or
  `--viewport-size="390,844"`.
