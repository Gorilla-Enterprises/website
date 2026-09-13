# Landing page render

The root route (`/`) shows the Gorilla Enterprises brand mark, the
"Gorilla" / "Enterprises" wordmark, and a "July 2027 · Rwanda" dateline,
centered on the branded dark background — full screen, nothing else.

## Sub-features

- `mark` — the brand silhouette image (`public/brand/gorilla-mark.png`).
- `wordmark` — "Gorilla" (display type) over "Enterprises" (tracked
  small caps).
- `dateline` — "July 2027 · Rwanda" beneath the wordmark.

## How to reach it (user POV)

- Navigate to `/` (the site's only route — this is also the homepage).

## Driving it with Playwright

Preconditions:

- Website is healthy at `http://localhost:3000` (Doctor check passes).

- **Mark renders.** Run
  `page.getByRole("img", { name: "Gorilla Enterprises" })` and assert
  `.toBeVisible()`. Confirms the image element resolved and painted
  (not just present in the DOM — a broken `src` would still be "present").
- **Wordmark renders.** Run `page.getByText("Gorilla", { exact: true })`
  and `page.getByText("Enterprises", { exact: true })`, assert both
  `.toBeVisible()`.
- **Dateline renders.** Run `page.getByText("July 2027")` and
  `page.getByText("Rwanda")`, assert both `.toBeVisible()`.
- **All of the above in one pass**: `npm run test:e2e` runs exactly this
  as `tests/landing.spec.ts`.
- **Proof.** `npx playwright screenshot http://localhost:3000 <path>.png`
  — the image should show mark, wordmark, and dateline stacked and
  centered against the dark background; open it and look.

## Gotchas

- The wordmark is two independent text nodes ("Gorilla", "Enterprises"),
  not one string — asserting on a combined string will never match.
- `getByText("Enterprises")` with `exact: true` is required — without it,
  Playwright's substring matching could also match if "Enterprises" ever
  becomes part of a longer sentence elsewhere on the page.
- **`toBeVisible()` on the mark does NOT catch a broken `src`.** Verified: a
  404'd image still renders a visible alt-text box in Chromium, so the
  assertion passes even when the image failed to load. `tests/landing.spec.ts`
  additionally asserts `naturalWidth > 0` on the `<img>` element — check that
  when adding new image assertions elsewhere on the site.
